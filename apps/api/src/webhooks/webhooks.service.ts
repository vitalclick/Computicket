import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

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
    this.logger.log(`Ignoring Paystack event: ${payload.event}`);
    return { handled: false, reason: 'unsupported_event' as const };
  }

  private async handleChargeSuccess(event: PaystackChargeSuccess) {
    const reference = event.data.reference;
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
    return { handled: true, issued: result.issued, ticketCount: result.tickets.length };
  }
}
