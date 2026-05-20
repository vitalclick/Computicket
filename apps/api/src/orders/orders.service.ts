import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { WalletService } from '../wallet/wallet.service';
import { TicketsService } from '../tickets/tickets.service';

interface CreateOrderInput {
  eventSlug: string;
  buyerEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  items: Array<{ ticketTypeId: string; quantity: number }>;
  callbackUrl?: string;
  userId?: string;
  promoCode?: string;
  payFromWallet?: boolean;
}

const HOLD_MINUTES = 15;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly promos: PromoCodesService,
    private readonly wallet: WalletService,
    private readonly tickets: TicketsService,
  ) {}

  async create(input: CreateOrderInput) {
    const event = await this.prisma.event.findUnique({
      where: { slug: input.eventSlug },
      include: {
        ticketTypes: true,
        organizer: { select: { paystackSubaccountCode: true } },
      },
    });
    if (!event) throw new NotFoundException(`Event "${input.eventSlug}" not found`);
    if (event.status !== 'PUBLISHED') throw new BadRequestException('Event is not on sale');

    const ttById = new Map(event.ticketTypes.map((t) => [t.id, t]));
    for (const item of input.items) {
      const tt = ttById.get(item.ticketTypeId);
      if (!tt) throw new BadRequestException(`Unknown ticketTypeId ${item.ticketTypeId}`);
      if (item.quantity <= 0) throw new BadRequestException('Quantity must be positive');
    }

    const reference = `ctng_${randomBytes(8).toString('hex')}`;

    const order = await this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const items: Array<{ ticketTypeId: string; quantity: number; unitPriceKobo: number }> = [];

      for (const item of input.items) {
        const tt = ttById.get(item.ticketTypeId)!;
        // Atomic hold: only succeed if (sold + held + quantity) <= capacity.
        const claimed = await tx.$executeRaw(Prisma.sql`
          UPDATE "TicketType"
          SET held = held + ${item.quantity}, "updatedAt" = NOW()
          WHERE id = ${tt.id}
            AND (sold + held + ${item.quantity}) <= capacity
        `);
        if (claimed === 0) {
          throw new BadRequestException(`Ticket type "${tt.name}" sold out`);
        }
        subtotal += tt.priceKobo * item.quantity;
        items.push({
          ticketTypeId: tt.id,
          quantity: item.quantity,
          unitPriceKobo: tt.priceKobo,
        });
      }

      // Apply promo code (if any) — validate, atomically claim, compute discount.
      let discount = 0;
      let promoCodeStored: string | undefined;
      if (input.promoCode) {
        const promo = await this.promos.findUsable(event.id, input.promoCode);
        if (!promo) throw new BadRequestException('Invalid or expired promo code');
        const claimed = await this.promos.claim(promo.id);
        if (!claimed) throw new BadRequestException('Promo code is no longer available');
        discount = this.promos.computeDiscount(subtotal, promo.type, promo.value);
        promoCodeStored = input.promoCode.trim().toUpperCase();
      }

      const subtotalAfterDiscount = subtotal - discount;
      const fee = Math.round(subtotalAfterDiscount * 0.015);
      const total = subtotalAfterDiscount + fee;

      return tx.order.create({
        data: {
          eventId: event.id,
          userId: input.userId,
          buyerEmail: input.buyerEmail,
          buyerName: input.buyerName,
          buyerPhone: input.buyerPhone,
          subtotalKobo: subtotal,
          discountKobo: discount,
          promoCode: promoCodeStored,
          feeKobo: fee,
          totalKobo: total,
          paidFromWallet: input.payFromWallet ?? false,
          expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
          paystackRef: reference,
          items: { create: items },
        },
        include: { items: true },
      });
    });

    // Wallet-paid path: debit the user's wallet and finalise the order
    // synchronously. Tickets are issued immediately; no Paystack roundtrip.
    if (input.payFromWallet) {
      if (!input.userId) {
        throw new BadRequestException('payFromWallet requires an authenticated user');
      }
      const debit = await this.wallet.debit({
        userId: input.userId,
        amountKobo: order.totalKobo,
        type: 'PURCHASE',
        orderId: order.id,
        note: `Order ${order.id}`,
      });
      if (!debit.ok) {
        // Release the held inventory we just claimed.
        await this.prisma.$transaction(async (tx) => {
          await tx.order.updateMany({
            where: { id: order.id, status: 'PENDING' },
            data: { status: 'EXPIRED' },
          });
          for (const item of order.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { held: { decrement: item.quantity } },
            });
          }
        });
        throw new BadRequestException('Insufficient wallet balance');
      }
      // Mark order paid and issue tickets through the same atomic
      // path the webhook uses.
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      // Inventory: webhook path uses TicketsService.issueForOrder which
      // expects PENDING; we already flipped to PAID so we issue directly.
      await this.tickets.issueAndReleaseHolds(order.id);
      return {
        order: { ...order, status: 'PAID' as const, paidFromWallet: true },
        paidFromWallet: true,
        walletBalanceAfterKobo: debit.balanceAfterKobo,
      };
    }

    const paystack = await this.paystack.initialize({
      email: input.buyerEmail,
      amountKobo: order.totalKobo,
      reference,
      callbackUrl: input.callbackUrl,
      metadata: { orderId: order.id, eventSlug: event.slug },
      subaccountCode: event.organizer.paystackSubaccountCode ?? undefined,
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
