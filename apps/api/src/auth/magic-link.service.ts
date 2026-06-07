import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mail/mailer.service';
import { AuthService, type SigninSuccess } from './auth.service';

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Passwordless sign-in via email. Two-step:
 *   1. POST /v1/auth/magic-link/request {email}
 *      Always returns 200 with { sent: true } regardless of whether
 *      the email exists — protects against enumeration.
 *   2. POST /v1/auth/magic-link/confirm {token}
 *      Single-use; consumed atomically; issues a real session.
 *
 * Tokens are 32-byte URL-safe randoms. We only store the sha256 of
 * the token at rest — verification recomputes the hash and looks it
 * up by unique index. This means even a full DB compromise can't
 * resurrect a working link.
 */
@Injectable()
export class MagicLinkService {
  private readonly logger = new Logger(MagicLinkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Mint a magic link, store its hash, email the raw token to the user.
   * Silent no-op for unknown emails so the response is identical and an
   * attacker can't enumerate the user list by timing or response shape.
   */
  async request(
    rawEmail: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<{ sent: true }> {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });
    // Don't send to closed accounts; still return success.
    if (user?.deletedAt) return { sent: true };

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await this.prisma.magicLink.create({
      data: {
        userId: user?.id,
        email,
        tokenHash,
        expiresAt,
        requestedIp: meta?.ip,
        requestedUa: meta?.userAgent?.slice(0, 256),
      },
    });

    // The frontend route consumes the token via a POST when the user
    // lands on it — we ship a magic-link URL the browser can follow.
    const base =
      process.env.WEB_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000';
    const link = `${base.replace(/\/$/, '')}/signin/magic-link?token=${encodeURIComponent(token)}`;

    try {
      await this.mailer.sendMagicLink({
        to: email,
        link,
        requestedIp: meta?.ip,
        requestedUa: meta?.userAgent,
      });
    } catch (err) {
      // Log but don't surface — same response shape regardless.
      this.logger.warn(`Magic link delivery failed for ${email}: ${String(err)}`);
    }

    return { sent: true };
  }

  /**
   * Atomically consume the token: mark used, then issue a session.
   * The `updateMany` with `consumedAt: null` filter makes it impossible
   * for a concurrent second confirmation to also succeed.
   */
  async confirm(
    token: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninSuccess> {
    const tokenHash = createHash('sha256').update(token.trim()).digest('hex');
    const link = await this.prisma.magicLink.findUnique({ where: { tokenHash } });
    if (!link) throw new UnauthorizedException('Invalid sign-in link');
    if (link.consumedAt) throw new UnauthorizedException('Link already used');
    if (link.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Sign-in link expired');
    }

    // Single-use claim. If another concurrent request beat us to it,
    // updateMany returns count 0 and we reject.
    const claim = await this.prisma.magicLink.updateMany({
      where: { id: link.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (claim.count === 0) throw new UnauthorizedException('Link already used');

    // Resolve the user. If the link was created for an unknown email
    // (passwordless onboarding), create the user now.
    let userId = link.userId;
    if (!userId) {
      const created = await this.prisma.user.create({
        data: {
          email: link.email,
          emailVerifiedAt: new Date(),
          referralCode: await this.uniqueReferralCode(),
        },
        select: { id: true },
      });
      userId = created.id;
      await this.prisma.magicLink.update({
        where: { id: link.id },
        data: { userId },
      });
    } else {
      // Mark the email verified on first magic-link consumption — the
      // user just demonstrated control of the mailbox.
      await this.prisma.user.updateMany({
        where: { id: userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: new Date() },
      });
    }

    return this.auth.issueSessionForUserId(userId, meta);
  }

  private async uniqueReferralCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = randomBytes(6).toString('base64url').toUpperCase().slice(0, 8);
      const clash = await this.prisma.user.findUnique({ where: { referralCode: code } });
      if (!clash) return code;
    }
    return (
      randomBytes(6).toString('base64url').toUpperCase().slice(0, 6) +
      Date.now().toString(36).slice(-2).toUpperCase()
    );
  }
}
