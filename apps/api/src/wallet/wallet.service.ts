import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma, WalletTxType } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';

interface CreditInput {
  userId: string;
  amountKobo: number;
  type: WalletTxType;
  orderId?: string;
  walletTopUpId?: string;
  refundId?: string;
  note?: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
  ) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalanceKobo: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { balanceKobo: user.walletBalanceKobo };
  }

  async listTransactions(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Atomic credit. Inserts a positive WalletTransaction and bumps the
   * cached balance in the same transaction.
   */
  async credit(input: CreditInput): Promise<{ balanceAfterKobo: number; transactionId: string }> {
    if (input.amountKobo <= 0) throw new BadRequestException('Credit amount must be positive');
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: input.userId },
        data: { walletBalanceKobo: { increment: input.amountKobo } },
        select: { walletBalanceKobo: true },
      });
      const t = await tx.walletTransaction.create({
        data: {
          userId: input.userId,
          amountKobo: input.amountKobo,
          type: input.type,
          balanceAfterKobo: user.walletBalanceKobo,
          orderId: input.orderId,
          walletTopUpId: input.walletTopUpId,
          refundId: input.refundId,
          note: input.note,
        },
      });
      return { balanceAfterKobo: user.walletBalanceKobo, transactionId: t.id };
    });
  }

  /**
   * Atomic debit. Conditional UPDATE ensures we never go negative under
   * concurrent debits. Returns false if balance was insufficient.
   */
  async debit(input: CreditInput): Promise<{ ok: boolean; balanceAfterKobo?: number; transactionId?: string }> {
    if (input.amountKobo <= 0) throw new BadRequestException('Debit amount must be positive');
    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.$executeRaw(Prisma.sql`
        UPDATE "User"
        SET "walletBalanceKobo" = "walletBalanceKobo" - ${input.amountKobo}, "updatedAt" = NOW()
        WHERE id = ${input.userId}
          AND "walletBalanceKobo" >= ${input.amountKobo}
      `);
      if (claim === 0) return { ok: false };
      const refreshed = await tx.user.findUniqueOrThrow({
        where: { id: input.userId },
        select: { walletBalanceKobo: true },
      });
      const t = await tx.walletTransaction.create({
        data: {
          userId: input.userId,
          amountKobo: -input.amountKobo,
          type: input.type,
          balanceAfterKobo: refreshed.walletBalanceKobo,
          orderId: input.orderId,
          refundId: input.refundId,
          note: input.note,
        },
      });
      return { ok: true, balanceAfterKobo: refreshed.walletBalanceKobo, transactionId: t.id };
    });
  }

  async initiateTopUp(
    userId: string,
    input: { amountKobo: number; callbackUrl?: string; email: string },
  ) {
    if (input.amountKobo < 10000) {
      throw new BadRequestException('Minimum top-up is NGN 100');
    }
    const reference = `wallet_${randomBytes(8).toString('hex')}`;
    const topUp = await this.prisma.walletTopUp.create({
      data: { userId, amountKobo: input.amountKobo, paystackRef: reference },
    });
    const paystack = await this.paystack.initialize({
      email: input.email,
      amountKobo: input.amountKobo,
      reference,
      callbackUrl: input.callbackUrl,
      metadata: { walletTopUpId: topUp.id, kind: 'wallet_top_up' },
    });
    return {
      topUp,
      paystack: {
        reference: paystack.reference,
        authorizationUrl: paystack.authorizationUrl,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? 'pk_test_placeholder',
      },
    };
  }

  /**
   * Called from the Paystack webhook handler when a charge.success
   * arrives with a reference matching a WalletTopUp. Idempotent.
   */
  async finaliseTopUp(reference: string, amountKobo: number): Promise<{ credited: boolean }> {
    const topUp = await this.prisma.walletTopUp.findUnique({ where: { paystackRef: reference } });
    if (!topUp) return { credited: false };
    if (topUp.status === 'PROCESSED') return { credited: false };
    if (topUp.amountKobo !== amountKobo) {
      this.logger.error(`Wallet top-up amount mismatch: stored ${topUp.amountKobo}, got ${amountKobo}`);
      return { credited: false };
    }

    // Claim the transition; only one webhook delivery wins.
    const claim = await this.prisma.walletTopUp.updateMany({
      where: { id: topUp.id, status: 'PENDING' },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
    if (claim.count === 0) return { credited: false };

    await this.credit({
      userId: topUp.userId,
      amountKobo: topUp.amountKobo,
      type: 'TOP_UP',
      walletTopUpId: topUp.id,
      note: 'Top-up via Paystack',
    });
    return { credited: true };
  }

  /**
   * Returns true if the reference belongs to a wallet top-up rather than
   * a regular ticket order. Used by the webhook router to fork.
   */
  async referenceIsTopUp(reference: string): Promise<boolean> {
    const t = await this.prisma.walletTopUp.findUnique({ where: { paystackRef: reference } });
    return !!t;
  }
}
