import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorporateService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.corporateAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });
  }

  async create(input: { name: string; billingEmail: string; creditLimitKobo?: number; adminEmail: string }) {
    if ((input.creditLimitKobo ?? 0) < 0) {
      throw new BadRequestException('creditLimitKobo must be non-negative');
    }
    const adminUser = await this.prisma.user.upsert({
      where: { email: input.adminEmail },
      update: {},
      create: { email: input.adminEmail },
    });
    return this.prisma.corporateAccount.create({
      data: {
        name: input.name,
        billingEmail: input.billingEmail,
        creditLimitKobo: input.creditLimitKobo ?? 0,
        members: { create: { userId: adminUser.id, role: 'ADMIN' } },
      },
      include: { members: { include: { user: { select: { email: true } } } } },
    });
  }

  async listMyAccounts(userId: string) {
    return this.prisma.corporateMember.findMany({
      where: { userId },
      include: { account: true },
    });
  }

  async addMember(
    accountId: string,
    callerId: string,
    input: { email: string; role?: 'ADMIN' | 'MEMBER'; perOrderLimitKobo?: number },
  ) {
    await this.assertAccountAdmin(accountId, callerId);
    const user = await this.prisma.user.upsert({
      where: { email: input.email },
      update: {},
      create: { email: input.email },
    });
    try {
      return await this.prisma.corporateMember.create({
        data: {
          corporateAccountId: accountId,
          userId: user.id,
          role: input.role ?? 'MEMBER',
          perOrderLimitKobo: input.perOrderLimitKobo,
        },
        include: { user: { select: { email: true, name: true } } },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('User is already a member of this account');
      }
      throw e;
    }
  }

  /**
   * Validate that the user can charge an order to this corporate account.
   * Returns the per-order limit (or Infinity) so the order service can
   * enforce it.
   */
  async assertCanCharge(
    accountId: string,
    userId: string,
    orderTotalKobo: number,
  ): Promise<void> {
    const member = await this.prisma.corporateMember.findUnique({
      where: { corporateAccountId_userId: { corporateAccountId: accountId, userId } },
      include: { account: true },
    });
    if (!member) throw new ForbiddenException('Not a member of this corporate account');
    if (member.perOrderLimitKobo !== null && orderTotalKobo > member.perOrderLimitKobo) {
      throw new BadRequestException(
        `Order exceeds your per-order limit (NGN ${(member.perOrderLimitKobo / 100).toLocaleString()})`,
      );
    }
    // Check the account's outstanding balance against credit limit.
    const outstanding = await this.outstandingBalanceKobo(accountId);
    if (outstanding + orderTotalKobo > member.account.creditLimitKobo) {
      throw new BadRequestException(
        `Charging this order would exceed the account credit limit ` +
          `(outstanding NGN ${(outstanding / 100).toLocaleString()}, ` +
          `limit NGN ${(member.account.creditLimitKobo / 100).toLocaleString()})`,
      );
    }
  }

  async outstandingBalanceKobo(accountId: string): Promise<number> {
    const agg = await this.prisma.order.aggregate({
      where: {
        corporateAccountId: accountId,
        status: 'PAID',
        corporateSettledAt: null,
      },
      _sum: { totalKobo: true },
    });
    return agg._sum.totalKobo ?? 0;
  }

  async getInvoice(accountId: string, callerId: string) {
    await this.assertAccountMember(accountId, callerId);
    const orders = await this.prisma.order.findMany({
      where: { corporateAccountId: accountId, status: 'PAID', corporateSettledAt: null },
      orderBy: { paidAt: 'asc' },
      include: { event: { select: { title: true } } },
    });
    const totalKobo = orders.reduce((acc, o) => acc + o.totalKobo, 0);
    return {
      outstandingKobo: totalKobo,
      orders: orders.map((o) => ({
        id: o.id,
        paidAt: o.paidAt,
        totalKobo: o.totalKobo,
        eventTitle: o.event.title,
        buyerEmail: o.buyerEmail,
      })),
    };
  }

  /**
   * Mark all currently-unsettled orders for this account as settled.
   * In production this would be triggered by a Paystack payment to the
   * account; for Phase 3 we expose it as an admin operation.
   */
  async settle(accountId: string, callerId: string) {
    await this.assertAccountAdmin(accountId, callerId);
    const result = await this.prisma.order.updateMany({
      where: { corporateAccountId: accountId, status: 'PAID', corporateSettledAt: null },
      data: { corporateSettledAt: new Date() },
    });
    return { settled: result.count };
  }

  private async assertAccountMember(accountId: string, userId: string) {
    const m = await this.prisma.corporateMember.findUnique({
      where: { corporateAccountId_userId: { corporateAccountId: accountId, userId } },
    });
    if (!m) throw new ForbiddenException('Not a member of this corporate account');
  }

  private async assertAccountAdmin(accountId: string, userId: string) {
    const m = await this.prisma.corporateMember.findUnique({
      where: { corporateAccountId_userId: { corporateAccountId: accountId, userId } },
    });
    if (!m || m.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN members can perform this action');
    }
  }
}
