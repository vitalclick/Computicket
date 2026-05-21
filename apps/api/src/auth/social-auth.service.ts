import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createPublicKey, verify as cryptoVerify } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, type SigninSuccess } from './auth.service';

/**
 * Verified provider claims, after we've validated the ID token's signature
 * and audience. `email` may be null if the user opted to hide it (Apple).
 */
interface VerifiedClaims {
  provider: 'GOOGLE' | 'APPLE';
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

interface AppleJwk {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

/**
 * Social login. Both providers ship the user a signed ID token on the
 * frontend; the API verifies the token, finds-or-creates the user, and
 * issues a Computicket session via AuthService.issueSessionForUserId.
 *
 * For existing emails we automatically link the social account to the
 * existing user — this is the expected behaviour (one account per
 * email) and matches what Google/Apple themselves do.
 */
@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);
  private readonly googleClient: OAuth2Client | null;
  private appleKeysCache: { keys: AppleJwk[]; fetchedAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    this.googleClient = clientId ? new OAuth2Client(clientId) : null;
  }

  // ──────────── Google ──────────────────────────────────────────────

  async signinWithGoogle(
    idToken: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninSuccess> {
    if (!this.googleClient || !process.env.GOOGLE_OAUTH_CLIENT_ID) {
      throw new BadRequestException(
        'Google sign-in is not configured on this environment',
      );
    }
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      this.logger.warn(`Google ID token verification failed: ${String(err)}`);
      throw new UnauthorizedException('Invalid Google sign-in');
    }
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Google sign-in did not return a subject');
    }
    const claims: VerifiedClaims = {
      provider: 'GOOGLE',
      providerId: payload.sub,
      email: payload.email ?? null,
      emailVerified: Boolean(payload.email_verified),
      name: payload.name ?? null,
    };
    const userId = await this.linkOrCreate(claims);
    return this.auth.issueSessionForUserId(userId, meta);
  }

  // ──────────── Apple ───────────────────────────────────────────────

  async signinWithApple(
    idToken: string,
    optionalUser?: { name?: string | null },
    meta?: { ip?: string; userAgent?: string },
  ): Promise<SigninSuccess> {
    const audience = process.env.APPLE_OAUTH_CLIENT_ID;
    if (!audience) {
      throw new BadRequestException(
        'Apple sign-in is not configured on this environment',
      );
    }
    const claims = await this.verifyAppleIdToken(idToken, audience);
    const userId = await this.linkOrCreate({
      provider: 'APPLE',
      providerId: claims.sub,
      email: claims.email ?? null,
      emailVerified: Boolean(claims.email_verified),
      // Apple only ships `name` on first sign-in; the frontend captures
      // it from the AppleID JS event and forwards it here so we can
      // backfill the profile on initial link.
      name: optionalUser?.name ?? null,
    });
    return this.auth.issueSessionForUserId(userId, meta);
  }

  private async verifyAppleIdToken(
    idToken: string,
    audience: string,
  ): Promise<{
    sub: string;
    email?: string;
    email_verified?: boolean | string;
  }> {
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Malformed Apple token');
    const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    if (payload.iss !== 'https://appleid.apple.com') {
      throw new UnauthorizedException('Wrong Apple issuer');
    }
    if (payload.aud !== audience) {
      throw new UnauthorizedException('Wrong Apple audience');
    }
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Apple token expired');
    }
    if (!payload.sub) throw new UnauthorizedException('Apple token missing sub');

    const key = await this.findAppleKey(header.kid);
    const pub = createPublicKey({
      key: { kty: key.kty, n: key.n, e: key.e, alg: 'RS256' },
      format: 'jwk',
    });
    const signingInput = Buffer.from(`${headerB64}.${payloadB64}`);
    const signature = Buffer.from(signatureB64, 'base64url');
    const ok = cryptoVerify('RSA-SHA256', signingInput, pub, signature);
    if (!ok) throw new UnauthorizedException('Apple token signature invalid');

    return payload;
  }

  private async findAppleKey(kid: string): Promise<AppleJwk> {
    // Apple rotates keys; cache the JWK set for an hour.
    const fresh = this.appleKeysCache && Date.now() - this.appleKeysCache.fetchedAt < 60 * 60 * 1000;
    if (!fresh) {
      const res = await fetch('https://appleid.apple.com/auth/keys');
      if (!res.ok) {
        throw new UnauthorizedException('Could not fetch Apple JWKs');
      }
      const body = (await res.json()) as { keys: AppleJwk[] };
      this.appleKeysCache = { keys: body.keys, fetchedAt: Date.now() };
    }
    const key = this.appleKeysCache!.keys.find((k) => k.kid === kid);
    if (!key) throw new UnauthorizedException('No matching Apple key id');
    return key;
  }

  // ──────────── Link / create user ──────────────────────────────────

  private async linkOrCreate(claims: VerifiedClaims): Promise<string> {
    // 1. Existing social account → sign in.
    const existingLink = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: { provider: claims.provider, providerId: claims.providerId },
      },
    });
    if (existingLink) {
      await this.prisma.socialAccount.update({
        where: { id: existingLink.id },
        data: { lastUsedAt: new Date() },
      });
      return existingLink.userId;
    }

    // 2. Email already belongs to a user → link to that user.
    if (claims.email) {
      const byEmail = await this.prisma.user.findUnique({
        where: { email: claims.email },
        select: { id: true, name: true, emailVerifiedAt: true },
      });
      if (byEmail) {
        await this.prisma.socialAccount.create({
          data: {
            userId: byEmail.id,
            provider: claims.provider,
            providerId: claims.providerId,
            email: claims.email,
            displayName: claims.name,
          },
        });
        // Promote unverified to verified on the back of a provider-
        // verified email — no need to send our own verification mail.
        if (!byEmail.emailVerifiedAt && claims.emailVerified) {
          await this.prisma.user.update({
            where: { id: byEmail.id },
            data: { emailVerifiedAt: new Date(), name: byEmail.name ?? claims.name ?? undefined },
          });
        }
        return byEmail.id;
      }
    }

    // 3. New user. We may have no email (Apple "hide my email" without
    //    relay address available) — synthesize a placeholder so the
    //    unique constraint holds; the user can set their real email
    //    from /account later.
    const email = claims.email ?? this.synthesizeEmail(claims.providerId, claims.provider);
    const referralCode = await this.uniqueReferralCode();
    const user = await this.prisma.user.create({
      data: {
        email,
        name: claims.name,
        emailVerifiedAt: claims.emailVerified ? new Date() : null,
        referralCode,
        socialAccounts: {
          create: {
            provider: claims.provider,
            providerId: claims.providerId,
            email: claims.email,
            displayName: claims.name,
          },
        },
      },
      select: { id: true },
    });
    return user.id;
  }

  private synthesizeEmail(providerId: string, provider: 'GOOGLE' | 'APPLE'): string {
    // Stable, opaque and unique per provider subject; users can replace
    // it from settings. The .ctng-private TLD is reserved for our use
    // and never resolves on the public internet.
    const hash = createHash('sha256').update(providerId).digest('hex').slice(0, 16);
    return `${provider.toLowerCase()}_${hash}@ctng-private`;
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
