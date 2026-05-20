import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Verifies the authenticated user is a member of the organizer the
 * request refers to. The organizer is resolved from one of, in order:
 *   1. route param `:organizerSlug`
 *   2. body field `organizerSlug`
 *   3. route param `:slug` interpreted as an event slug
 *   4. route param `:orderId` (look up order -> event -> organizer)
 *
 * Must run after JwtAuthGuard so req.user is populated.
 */
@Injectable()
export class OrganizerMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const organizerSlug = await this.resolveOrganizerSlug(req);
    if (!organizerSlug) throw new NotFoundException('Organizer not found');

    const membership = await this.prisma.organizerMember.findFirst({
      where: { userId, organizer: { slug: organizerSlug } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this organizer');
    return true;
  }

  private async resolveOrganizerSlug(req: Request): Promise<string | null> {
    const params = req.params as Record<string, string | undefined>;
    if (params.organizerSlug) return params.organizerSlug;
    const body = req.body as Record<string, unknown> | undefined;
    if (body && typeof body.organizerSlug === 'string') return body.organizerSlug;
    if (params.slug) {
      const event = await this.prisma.event.findUnique({
        where: { slug: params.slug },
        select: { organizer: { select: { slug: true } } },
      });
      return event?.organizer.slug ?? null;
    }
    if (params.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: params.orderId },
        select: { event: { select: { organizer: { select: { slug: true } } } } },
      });
      return order?.event.organizer.slug ?? null;
    }
    return null;
  }
}
