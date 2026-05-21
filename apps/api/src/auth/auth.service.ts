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
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(input: SignupInput) {
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

    return this.issueToken(user);
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

  async signin(input: SigninInput): Promise<SigninResult> {
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
    return this.issueToken(user);
  }

  /**
   * Second step of 2FA signin. Validates the challenge token from step 1
   * and the freshly-typed TOTP code, then issues a real session.
   */
  async signin2FA(challengeToken: string, totpCode: string): Promise<SigninSuccess> {
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
    return this.issueToken(user);
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

  async verifyToken(token: string): Promise<AuthedUser> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token);
      return { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async issueToken(user: { id: string; email: string; name: string | null }) {
    // Clear lockout state on any successful issuance — covers both
    // password signin and the 2FA challenge completion path.
    await this.prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [{ failedSigninCount: { gt: 0 } }, { lockedUntil: { not: null } }],
      },
      data: { failedSigninCount: 0, lockedUntil: null },
    });
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
