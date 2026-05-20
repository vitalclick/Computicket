import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { MailerService } from '../mail/mailer.service';
import { SmsService } from '../mail/sms.service';
import { WebhookDispatcher } from '../developers/webhook-dispatcher.service';
import { RefundsService } from '../refunds/refunds.service';
import { WalletService } from '../wallet/wallet.service';

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
    }

    return { handled: true, issued: result.issued, ticketCount: result.tickets.length };
  }
}
