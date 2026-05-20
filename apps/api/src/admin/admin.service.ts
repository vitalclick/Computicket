import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrganizers() {
    const rows = await this.prisma.organizer.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { events: true } },
        members: {
          where: { role: 'OWNER' },
          take: 1,
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    return rows.map((o) => ({
      id: o.id,
      slug: o.slug,
      name: o.name,
      status: o.status,
      description: o.description,
      createdAt: o.createdAt,
      approvedAt: o.approvedAt,
      commissionBps: o.commissionBps,
      eventCount: o._count.events,
      owner: o.members[0]?.user ?? null,
      payout: {
        bankCode: o.payoutBankCode,
        accountNumber: o.payoutAccountNumber,
        accountName: o.payoutAccountName,
        subaccountCode: o.paystackSubaccountCode,
      },
      kycNotes: o.kycNotes,
    }));
  }

  async approve(slug: string, adminId: string) {
    const updated = await this.prisma.organizer.updateMany({
      where: { slug, status: { in: ['PENDING', 'SUSPENDED'] } },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: adminId },
    });
    if (updated.count === 0) {
      throw new NotFoundException('Organizer not found or already approved');
    }
    return this.prisma.organizer.findUniqueOrThrow({
      where: { slug },
      select: { slug: true, status: true, approvedAt: true },
    });
  }

  async suspend(slug: string) {
    const updated = await this.prisma.organizer.updateMany({
      where: { slug, status: 'APPROVED' },
      data: { status: 'SUSPENDED' },
    });
    if (updated.count === 0) throw new NotFoundException('Organizer not found or not approved');
    return this.prisma.organizer.findUniqueOrThrow({
      where: { slug },
      select: { slug: true, status: true },
    });
  }

  async setCommission(slug: string, bps: number) {
    const updated = await this.prisma.organizer.update({
      where: { slug },
      data: { commissionBps: bps },
      select: { slug: true, commissionBps: true },
    });
    return updated;
  }

  async setKycNotes(slug: string, notes: string) {
    return this.prisma.organizer.update({
      where: { slug },
      data: { kycNotes: notes },
      select: { slug: true, kycNotes: true },
    });
  }

  async platformStats() {
    const [organizers, events, paidOrders, refundedOrders, totalGross] = await Promise.all([
      this.prisma.organizer.count(),
      this.prisma.event.count(),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.count({ where: { status: 'REFUNDED' } }),
      this.prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { totalKobo: true, feeKobo: true },
      }),
    ]);
    return {
      organizers,
      events,
      paidOrders,
      refundedOrders,
      grossKobo: totalGross._sum.totalKobo ?? 0,
      buyerFeesKobo: totalGross._sum.feeKobo ?? 0,
    };
  }
}
