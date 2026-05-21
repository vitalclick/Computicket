import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Optional gate that refuses requests from accounts whose email is not
 * verified. Off by default — set REQUIRE_VERIFIED_EMAIL=1 to enforce.
 * Must run after JwtAuthGuard so req.user is populated.
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (process.env.REQUIRE_VERIFIED_EMAIL !== '1') return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerifiedAt: true },
    });
    if (!u?.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verify your email address before performing this action.',
      );
    }
    return true;
  }
}
