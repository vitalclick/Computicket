import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const BCRYPT_ROUNDS = 12;

function generateReferralCode(): string {
  // 8-char URL-safe code, e.g. "AB3X7K9P"
  return randomBytes(6).toString('base64url').toUpperCase().slice(0, 8);
}

interface SignupInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  referralCode?: string;
}

interface SigninInput {
  email: string;
  password: string;
  totpCode?: string;
}

export interface SigninSuccess {
  token: string;
  user: { id: string; email: string; name: string | null };
}

export interface Signin2FAChallenge {
  requires2FA: true;
  // Short-lived ticket that the client returns alongside the TOTP code.
  // Lets us bind the second step to the first without storing pending
  // sessions, and rules out reuse without a fresh password check.
  challengeToken: string;
}

export type SigninResult = SigninSuccess | Signin2FAChallenge;

export interface AuthedUser {
  id: string;
  email: string;
  sessionId: string;
}

const SESSION_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(input: SignupInput, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing?.passwordHash) {
      throw new ConflictException('Email already registered');
    }

    // Resolve optional referral attribution. Unknown code is silently
    // ignored — we don't want to block signup over a typo.
    let referrer: { id: string } | null = null;
    if (input.referralCode) {
      referrer = await this.prisma.user.findUnique({
        where: { referralCode: input.referralCode.trim().toUpperCase() },
        select: { id: true },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const referralCode = await this.generateUniqueReferralCode();

    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: input.name ?? existing.name,
            phone: input.phone ?? existing.phone,
            referralCode: existing.referralCode ?? referralCode,
            referredById: existing.referredById ?? referrer?.id,
          },
        })
      : await this.prisma.user.create({
          data: {
            email: input.email,
            passwordHash,
            name: input.name,
            phone: input.phone,
            referralCode,
            referredById: referrer?.id,
          },
        });

    // Record the pending referral row; the reward fires on the referee's
    // first paid order.
    if (referrer && referrer.id !== user.id) {
      await this.prisma.referral.upsert({
        where: { refereeId: user.id },
        update: {},
        create: { referrerId: referrer.id, refereeId: user.id },
      });
    }

    return this.issueToken(user, meta);
  }

  private async generateUniqueReferralCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = generateReferralCode();
      const clash = await this.prisma.user.findUnique({ where: { referralCode: code } });
      if (!clash) return code;
    }
    // Astronomical collision odds, but tolerate it by appending random suffix.
    return generateReferralCode() + Date.now().toString(36).slice(-2).toUpperCase();
  }

  async signin(
    input: SigninInput,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninResult> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid email or password');
    if (user.deletedAt) throw new UnauthorizedException('Account closed');

    // Progressive lockout: 5 failures in a row trips a 15-minute hold.
    // The counter resets on the next successful signin (or after the
    // lockedUntil window expires).
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new UnauthorizedException(
        `Too many failed sign-ins. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      );
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      const nextCount = user.failedSigninCount + 1;
      const shouldLock = nextCount >= 5;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedSigninCount: shouldLock ? 0 : nextCount,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60_000) : user.lockedUntil,
        },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.totpEnabledAt) {
      // Without a code, hand back a short-lived challenge token. The
      // client re-posts {challengeToken, totpCode}; we verify both and
      // then issue the real session.
      if (!input.totpCode) {
        const challengeToken = await this.jwt.signAsync(
          { sub: user.id, purpose: '2fa-challenge' },
          { expiresIn: '5m' },
        );
        return { requires2FA: true, challengeToken };
      }
      const ok2 = await this.totpVerifier(user.id, input.totpCode);
      if (!ok2) throw new UnauthorizedException('Invalid 2FA code');
    }
    return this.issueToken(user, meta);
  }

  /**
   * Second step of 2FA signin. Validates the challenge token from step 1
   * and the freshly-typed TOTP code, then issues a real session.
   */
  async signin2FA(
    challengeToken: string,
    totpCode: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninSuccess> {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwt.verifyAsync(challengeToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA challenge');
    }
    if (payload.purpose !== '2fa-challenge') {
      throw new UnauthorizedException('Invalid 2FA challenge');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.deletedAt) throw new UnauthorizedException('Account closed');
    const ok = await this.totpVerifier(user.id, totpCode);
    if (!ok) throw new UnauthorizedException('Invalid 2FA code');
    return this.issueToken(user, meta);
  }

  /**
   * Injected at app bootstrap by SecurityModule to break the circular
   * dependency (AuthModule -> SecurityModule -> AuthModule). Defaults to
   * a reject-all stub so misconfiguration fails closed.
   */
  private totpVerifier: (userId: string, code: string) => Promise<boolean> = async () => false;

  setTotpVerifier(fn: (userId: string, code: string) => Promise<boolean>) {
    this.totpVerifier = fn;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organizer: { select: { id: true, slug: true, name: true, status: true } },
          },
        },
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      referralCode: user.referralCode,
      memberships: user.memberships.map((m) => ({
        role: m.role,
        organizer: m.organizer,
      })),
    };
  }

  async verifyToken(
    token: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthedUser> {
    let payload: { sub: string; email: string; jti?: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (!payload.jti) {
      // Legacy token issued before sessions existed. Refuse — forces a
      // fresh sign-in, which is the conservative move on the upgrade.
      throw new UnauthorizedException('Token missing session id; please sign in again');
    }
    const session = await this.prisma.session.findUnique({ where: { jti: payload.jti } });
    if (!session) throw new UnauthorizedException('Session not found');
    if (session.revokedAt) throw new UnauthorizedException('Session revoked');
    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }
    // Hot-path optimisation: only write lastUsedAt if the stored value
    // is more than 60s stale, so a burst of authed requests doesn't
    // hammer the row.
    if (Date.now() - session.lastUsedAt.getTime() > 60_000) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date(), ...(meta?.ip ? { ipAddress: meta.ip } : {}) },
      });
    }
    return { id: payload.sub, email: payload.email, sessionId: session.id };
  }

  /**
   * Revoke a single session. Used by the /me/sessions endpoint and
   * indirectly by password change / 2FA-disable flows.
   */
  async revokeSession(userId: string, sessionId: string) {
    const updated = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { revoked: updated.count > 0 };
  }

  /**
   * Revoke every session for a user except optionally the current one.
   * Called from "log out everywhere" and from sensitive account events.
   */
  async revokeAllSessions(userId: string, exceptSessionId?: string) {
    const updated = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
    return { revokedCount: updated.count };
  }

  async listSessions(userId: string, currentSessionId: string) {
    const rows = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
    });
    return rows.map((r) => ({ ...r, current: r.id === currentSessionId }));
  }

  /**
   * Public entry point for external sign-in flows (social login,
   * magic link) once the email is provider-verified. Looks the user
   * up and delegates to issueToken — same session + JWT shape as
   * password sign-in.
   */
  async issueSessionForUserId(
    userId: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninSuccess> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, deletedAt: true },
    });
    if (user.deletedAt) throw new UnauthorizedException('Account closed');
    return this.issueToken({ id: user.id, email: user.email, name: user.name }, meta);
  }

  private async issueToken(
    user: { id: string; email: string; name: string | null },
    meta?: { ip?: string; userAgent?: string },
  ) {
    // Clear lockout state on any successful issuance — covers both
    // password signin and the 2FA challenge completion path.
    await this.prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [{ failedSigninCount: { gt: 0 } }, { lockedUntil: { not: null } }],
      },
      data: { failedSigninCount: 0, lockedUntil: null },
    });
    const jti = randomBytes(18).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        jti,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent?.slice(0, 256),
        expiresAt,
      },
    });
    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email, jti },
      { expiresIn: `${SESSION_TTL_DAYS}d` },
    );
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
