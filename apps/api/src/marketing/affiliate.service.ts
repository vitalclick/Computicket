import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AffiliateService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizerSlug: string) {
    const links = await this.prisma.affiliateLink.findMany({
      where: { organizer: { slug: organizerSlug } },
      orderBy: { createdAt: 'desc' },
    });
    // Attribute paid orders by code.
    const counts = await this.prisma.order.groupBy({
      by: ['affiliateCode'],
      where: {
        status: 'PAID',
        affiliateCode: { in: links.map((l) => l.code) },
        event: { organizer: { slug: organizerSlug } },
      },
      _count: { _all: true },
      _sum: { totalKobo: true },
    });
    const byCode = new Map(counts.map((c) => [c.affiliateCode!, c]));
    return links.map((l) => ({
      ...l,
      paidOrders: byCode.get(l.code)?._count._all ?? 0,
      revenueKobo: byCode.get(l.code)?._sum.totalKobo ?? 0,
    }));
  }

  async create(organizerSlug: string, input: { code: string; name: string }) {
    const organizer = await this.prisma.organizer.findUnique({ where: { slug: organizerSlug } });
    if (!organizer) throw new NotFoundException('Organizer not found');
    try {
      return await this.prisma.affiliateLink.create({
        data: {
          organizerId: organizer.id,
          code: input.code.trim().toUpperCase(),
          name: input.name,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Code already in use for this organizer');
      }
      throw e;
    }
  }

  async deactivate(organizerSlug: string, id: string) {
    const updated = await this.prisma.affiliateLink.updateMany({
      where: { id, organizer: { slug: organizerSlug } },
      data: { active: false },
    });
    if (updated.count === 0) throw new NotFoundException('Affiliate link not found');
    return { id, active: false };
  }

  /**
   * Resolve a public affiliate code to a known link. Used by the orders
   * service to attribute a sale.
   */
  async resolveCode(code: string) {
    return this.prisma.affiliateLink.findFirst({
      where: { code: code.trim().toUpperCase(), active: true },
      select: { code: true, organizerId: true },
    });
  }
}
