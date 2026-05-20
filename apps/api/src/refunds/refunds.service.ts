import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';
import { MailerService } from '../mail/mailer.service';
import { WebhookDispatcher } from '../developers/webhook-dispatcher.service';
import { WalletService } from '../wallet/wallet.service';

interface RefundInput {
  orderId: string;
  amountKobo?: number; // omit for full refund of remaining balance
  reason?: string;
  initiatedById?: string;
  toWallet?: boolean;
}

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly mailer: MailerService,
    private readonly outbound: WebhookDispatcher,
    private readonly wallet: WalletService,
  ) {}

  async refund(input: RefundInput) {
    const order = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: true,
        event: {
          select: { title: true, organizerId: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'REFUNDED') {
      return {
        orderId: order.id,
        status: 'REFUNDED' as const,
        refundedAmountKobo: order.refundedKobo,
        remainingKobo: 0,
        partial: false,
        alreadyRefunded: true,
      };
    }
    if (order.status !== 'PAID') {
      throw new BadRequestException(
        `Cannot refund order in status ${order.status}; only PAID orders are refundable`,
      );
    }
    if (!order.paystackRef) {
      throw new BadRequestException('Order has no Paystack reference');
    }

    const remaining = order.totalKobo - order.refundedKobo;
    const amount = input.amountKobo ?? remaining;
    if (amount <= 0) throw new BadRequestException('Refund amount must be positive');
    if (amount > remaining) {
      throw new BadRequestException(
        `Refund exceeds remaining refundable balance (${remaining} kobo)`,
      );
    }

    const isFinal = amount === remaining;

    // Record the refund attempt first (PENDING) so we can correlate the
    // async Paystack refund webhook when it arrives.
    const refund = await this.prisma.refund.create({
      data: {
        orderId: order.id,
        amountKobo: amount,
        reason: input.reason,
        initiatedById: input.initiatedById,
      },
    });

    // Two refund destinations:
    //   toWallet=true  -> credit the buyer's wallet, no Paystack call
    //   toWallet=false -> call Paystack refund (default; reverses to card/bank)
    if (input.toWallet) {
      if (!order.userId) {
        throw new BadRequestException('Cannot refund to wallet on a guest order');
      }
      await this.wallet.credit({
        userId: order.userId,
        amountKobo: amount,
        type: 'REFUND',
        orderId: order.id,
        refundId: refund.id,
        note: 'Refund to wallet',
      });
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    } else {
      try {
        const result = await this.paystack.refund(order.paystackRef, amount);
        await this.prisma.refund.update({
          where: { id: refund.id },
          data: {
            status: result.status === 'failed' ? 'FAILED' : 'PROCESSED',
            paystackRefundId: result.refundId,
            processedAt: result.status === 'failed' ? null : new Date(),
          },
        });
        if (result.status === 'failed') {
          throw new BadRequestException('Refund declined by payment provider');
        }
      } catch (e) {
        await this.prisma.refund.update({
          where: { id: refund.id },
          data: { status: 'FAILED' },
        });
        throw e;
      }
    }

    // Apply state changes atomically.
    const result = await this.prisma.$transaction(async (tx) => {
      // Bump refundedKobo via conditional update so concurrent partials
      // never over-refund.
      const claim = await tx.order.updateMany({
        where: { id: order.id, refundedKobo: { lte: order.totalKobo - amount } },
        data: { refundedKobo: { increment: amount } },
      });
      if (claim.count === 0) {
        // Someone else processed a partial in the meantime; the refund row
        // is already PROCESSED — leave it for reconciliation rather than
        // unwinding the Paystack-side debit.
        this.logger.warn(
          `Refund ${refund.id} processed at Paystack but lost the local race; reconcile`,
        );
        return { voided: 0, becameFinal: false };
      }

      if (!isFinal) return { voided: 0, becameFinal: false };

      // Final refund: flip status, void tickets, release sold counter.
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { sold: { decrement: item.quantity } },
        });
      }
      const voided = await tx.ticket.updateMany({
        where: { orderId: order.id, status: { in: ['ISSUED', 'SCANNED'] } },
        data: { status: 'VOIDED' },
      });
      return { voided: voided.count, becameFinal: true };
    });

    // Outbound webhook + buyer email (only on becoming final).
    if (result.becameFinal) {
      this.outbound
        .dispatch({
          organizerId: order.event.organizerId,
          event: 'order.refunded',
          data: {
            orderId: order.id,
            reference: order.paystackRef,
            refundedAmountKobo: order.totalKobo,
            voidedTickets: result.voided,
          },
        })
        .catch((e) => this.logger.error(`Outbound dispatch failed: ${e.message}`));
      try {
        await this.mailer.sendRefundNotification({
          to: order.buyerEmail,
          buyerName: order.buyerName,
          eventTitle: order.event.title,
          amountKobo: order.totalKobo,
        });
      } catch (e) {
        this.logger.error(`Refund email failed for ${order.id}: ${(e as Error).message}`);
      }
    }

    return {
      orderId: order.id,
      refundId: refund.id,
      status: isFinal ? ('REFUNDED' as const) : ('PARTIAL' as const),
      refundedAmountKobo: order.refundedKobo + amount,
      remainingKobo: remaining - amount,
      partial: !isFinal,
      alreadyRefunded: false,
    };
  }

  /**
   * Called by the Paystack refund webhook handler. Marks a tracked
   * refund as PROCESSED. Idempotent.
   */
  async markPaystackRefundProcessed(paystackRefundId: string) {
    const updated = await this.prisma.refund.updateMany({
      where: { paystackRefundId, status: { not: 'PROCESSED' } },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
    return { updated: updated.count };
  }
}
