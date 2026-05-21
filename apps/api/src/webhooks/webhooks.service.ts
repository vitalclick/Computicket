import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { MailerService } from '../mail/mailer.service';
import { SmsService } from '../mail/sms.service';
import { WebhookDispatcher } from '../developers/webhook-dispatcher.service';
import { RefundsService } from '../refunds/refunds.service';
import { WalletService } from '../wallet/wallet.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PushService } from '../push/push.service';
import { BookingsService } from '../lodging/bookings.service';

interface PaystackChargeSuccess {
  event: 'charge.success';
  data: { reference: string; amount: number; status: string; paid_at?: string };
}

type PaystackEvent =
  | PaystackChargeSuccess
  | { event: string; data: { reference?: string } };

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tickets: TicketsService,
    private readonly mailer: MailerService,
    private readonly outbound: WebhookDispatcher,
    private readonly refunds: RefundsService,
    private readonly wallet: WalletService,
    private readonly sms: SmsService,
    private readonly loyalty: LoyaltyService,
    private readonly bookings: BookingsService,
    private readonly push: PushService,
  ) {}

  verifyPaystackSignature(rawBody: Buffer, signature: string | undefined): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !signature) return false;
    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async handlePaystackEvent(payload: PaystackEvent) {
    if (payload.event === 'charge.success') {
      return this.handleChargeSuccess(payload as PaystackChargeSuccess);
    }
    if (payload.event === 'refund.processed') {
      const data = (payload as { data: { id?: string | number } }).data;
      const refundId = data.id !== undefined ? String(data.id) : undefined;
      if (!refundId) return { handled: false, reason: 'no_refund_id' as const };
      const r = await this.refunds.markPaystackRefundProcessed(refundId);
      return { handled: true, updated: r.updated };
    }
    this.logger.log(`Ignoring Paystack event: ${payload.event}`);
    return { handled: false, reason: 'unsupported_event' as const };
  }

  private async handleChargeSuccess(event: PaystackChargeSuccess) {
    const reference = event.data.reference;

    // Branch: wallet top-up references credit the user's wallet rather
    // than triggering ticket issuance.
    if (await this.wallet.referenceIsTopUp(reference)) {
      const r = await this.wallet.finaliseTopUp(reference, event.data.amount);
      return { handled: true, kind: 'wallet_top_up', credited: r.credited };
    }

    // Branch: hotel / flight bookings.
    if (await this.bookings.referenceIsLodging(reference)) {
      const r = await this.bookings.finaliseByReference(reference, event.data.amount);
      return { handled: true, kind: `lodging_${r.kind}`, finalised: r.finalised };
    }

    const order = await this.prisma.order.findUnique({ where: { paystackRef: reference } });
    if (!order) {
      this.logger.warn(`charge.success for unknown reference ${reference}`);
      return { handled: false, reason: 'unknown_reference' as const };
    }

    if (event.data.amount !== order.totalKobo) {
      this.logger.error(
        `Amount mismatch for ${reference}: expected ${order.totalKobo}, got ${event.data.amount}`,
      );
      return { handled: false, reason: 'amount_mismatch' as const };
    }

    const result = await this.tickets.issueForOrder(order.id);

    // Only send the confirmation on the first issuance, not on webhook replays.
    if (result.issued) {
      const full = await this.prisma.order.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          event: true,
          tickets: { include: { ticketType: { select: { name: true } } } },
        },
      });

      // Outbound webhook to the organizer's subscribers.
      this.outbound
        .dispatch({
          organizerId: full.event.organizerId,
          event: 'order.paid',
          data: {
            orderId: full.id,
            reference: full.paystackRef,
            totalKobo: full.totalKobo,
            buyerEmail: full.buyerEmail,
            eventId: full.eventId,
            ticketCount: full.tickets.length,
          },
        })
        .catch((e) => this.logger.error(`Outbound dispatch failed: ${e.message}`));

      try {
        await this.mailer.sendOrderConfirmation({
          to: full.buyerEmail,
          buyerName: full.buyerName,
          eventTitle: full.event.title,
          eventVenue: full.event.venue,
          eventCity: full.event.city,
          eventStartsAt: full.event.startsAt,
          totalKobo: full.totalKobo,
          tickets: full.tickets.map((t) => ({
            code: t.code,
            ticketTypeName: t.ticketType.name,
          })),
        });
      } catch (e) {
        this.logger.error(`Email send failed for order ${order.id}: ${(e as Error).message}`);
      }

      // Best-effort SMS confirmation when the buyer left a phone number.
      this.sms.send(
        full.buyerPhone,
        `Computicket: ${full.tickets.length} ticket(s) confirmed for ${full.event.title}. ` +
          `Check your email or computicket.ng/account for QR codes.`,
      ).catch(() => undefined);

      // Push notification: only fires for authed buyers — guest
      // checkouts don't have a userId and so can't be addressed.
      if (full.userId) {
        this.push
          .sendToUser(full.userId, {
            title: 'Your tickets are ready',
            body: `${full.tickets.length} ticket${full.tickets.length === 1 ? '' : 's'} for ${full.event.title}.`,
            deepLink: `/tickets/${full.tickets[0]?.code ?? ''}`,
            data: { orderId: full.id, kind: 'order.paid' },
          })
          .catch((e) => this.logger.error(`Push send failed: ${(e as Error).message}`));
      }

      // Referral reward: if this is the buyer's first paid order and a
      // pending referral row exists, credit the referrer's wallet.
      if (full.userId) {
        await this.tryRewardReferral(full.userId, full.id).catch((e) =>
          this.logger.error(`Referral reward failed: ${(e as Error).message}`),
        );

        // Loyalty: credit points for the spend.
        const earned = this.loyalty.pointsForSpend(full.totalKobo);
        if (earned > 0) {
          await this.prisma.$transaction(async (tx) => {
            await this.loyalty.credit(tx, full.userId!, earned, 'EARN', `Order ${full.id}`, full.id);
            await tx.order.update({ where: { id: full.id }, data: { loyaltyPointsEarned: earned } });
          });
        }
      }

      // Agent commission: if the order came in with an agent code,
      // credit the agent's wallet for the computed commission.
      if (full.agentCode && full.agentCommissionKobo > 0) {
        const agent = await this.prisma.agentProfile.findUnique({
          where: { agentCode: full.agentCode },
        });
        if (agent) {
          await this.wallet.credit({
            userId: agent.userId,
            amountKobo: full.agentCommissionKobo,
            type: 'ADJUSTMENT',
            orderId: full.id,
            note: `Agent commission (${full.agentCode}) on order ${full.id}`,
          });
        }
      }
    }

    return { handled: true, issued: result.issued, ticketCount: result.tickets.length };
  }

  private async tryRewardReferral(refereeId: string, orderId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { refereeId },
      include: { referrer: { select: { id: true, email: true } } },
    });
    if (!referral || referral.status === 'REWARDED') return;

    // Conditional update so concurrent webhook deliveries can't double-credit.
    const claim = await this.prisma.referral.updateMany({
      where: { id: referral.id, status: 'PENDING' },
      data: { status: 'REWARDED', rewardedAt: new Date(), orderId },
    });
    if (claim.count === 0) return;

    await this.wallet.credit({
      userId: referral.referrer.id,
      amountKobo: referral.rewardKobo,
      type: 'ADJUSTMENT',
      orderId,
      note: `Referral reward — referee bought their first ticket`,
    });
    this.logger.log(
      `Rewarded referral ${referral.id}: NGN ${referral.rewardKobo / 100} -> ${referral.referrer.email}`,
    );
  }
}
