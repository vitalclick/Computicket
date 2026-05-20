import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';
import { MailerService } from '../mail/mailer.service';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly mailer: MailerService,
  ) {}

  async refund(orderId: string): Promise<{
    orderId: string;
    status: 'REFUNDED';
    refundedAmountKobo: number;
    voidedTickets: number;
    alreadyRefunded: boolean;
  }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        event: { select: { title: true, venue: true, city: true, startsAt: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status === 'REFUNDED') {
      return {
        orderId: order.id,
        status: 'REFUNDED',
        refundedAmountKobo: order.totalKobo,
        voidedTickets: 0,
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

    // Call Paystack first — if this fails we want no DB mutation.
    await this.paystack.refund(order.paystackRef, order.totalKobo);

    // Apply state change atomically. Conditional update prevents a
    // concurrent second refund call from double-running this branch.
    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.order.updateMany({
        where: { id: order.id, status: 'PAID' },
        data: { status: 'REFUNDED' },
      });
      if (claim.count === 0) {
        return { voided: 0, alreadyRefunded: true };
      }

      // Release inventory and void tickets.
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
      return { voided: voided.count, alreadyRefunded: false };
    });

    if (!result.alreadyRefunded) {
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
      status: 'REFUNDED',
      refundedAmountKobo: order.totalKobo,
      voidedTickets: result.voided,
      alreadyRefunded: result.alreadyRefunded,
    };
  }
}
