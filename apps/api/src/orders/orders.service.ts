import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';

interface CreateOrderInput {
  eventSlug: string;
  buyerEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  items: Array<{ ticketTypeId: string; quantity: number }>;
  callbackUrl?: string;
}

const HOLD_MINUTES = 15;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
  ) {}

  async create(input: CreateOrderInput) {
    const event = await this.prisma.event.findUnique({
      where: { slug: input.eventSlug },
      include: { ticketTypes: true },
    });
    if (!event) throw new NotFoundException(`Event "${input.eventSlug}" not found`);
    if (event.status !== 'PUBLISHED') throw new BadRequestException('Event is not on sale');

    const ttById = new Map(event.ticketTypes.map((t) => [t.id, t]));
    let subtotal = 0;
    const items: Array<{ ticketTypeId: string; quantity: number; unitPriceKobo: number }> = [];

    for (const item of input.items) {
      const tt = ttById.get(item.ticketTypeId);
      if (!tt) throw new BadRequestException(`Unknown ticketTypeId ${item.ticketTypeId}`);
      if (item.quantity <= 0) throw new BadRequestException('Quantity must be positive');
      if (tt.sold + item.quantity > tt.capacity) {
        throw new BadRequestException(`Ticket type "${tt.name}" sold out`);
      }
      subtotal += tt.priceKobo * item.quantity;
      items.push({ ticketTypeId: tt.id, quantity: item.quantity, unitPriceKobo: tt.priceKobo });
    }

    const fee = Math.round(subtotal * 0.015);
    const total = subtotal + fee;
    const reference = `ctng_${randomBytes(8).toString('hex')}`;

    const order = await this.prisma.order.create({
      data: {
        eventId: event.id,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        buyerPhone: input.buyerPhone,
        subtotalKobo: subtotal,
        feeKobo: fee,
        totalKobo: total,
        expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
        paystackRef: reference,
        items: { create: items },
      },
      include: { items: true },
    });

    const paystack = await this.paystack.initialize({
      email: input.buyerEmail,
      amountKobo: total,
      reference,
      callbackUrl: input.callbackUrl,
      metadata: { orderId: order.id, eventSlug: event.slug },
    });

    return {
      order,
      paystack: {
        reference: paystack.reference,
        authorizationUrl: paystack.authorizationUrl,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? 'pk_test_placeholder',
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, tickets: true, event: true },
    });
    if (!order) throw new NotFoundException(`Order "${id}" not found`);
    return order;
  }

  async findByReference(reference: string) {
    const order = await this.prisma.order.findUnique({
      where: { paystackRef: reference },
      include: { items: true, tickets: true, event: true },
    });
    if (!order) throw new NotFoundException(`Order with reference "${reference}" not found`);
    return order;
  }
}
