import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@computicket/db';

function generateTicketCode(): string {
  // 16 alphanumeric chars; collision space ≈ 36^16 ≈ 8e24
  return `TKT-${randomBytes(10).toString('base64url').toUpperCase().slice(0, 16)}`;
}

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically mark an order as paid and issue tickets. Idempotent:
   * if the order is already PAID, returns the existing tickets and
   * does not double-issue or double-increment inventory.
   */
  async issueForOrder(orderId: string): Promise<{ issued: boolean; tickets: { id: string; code: string }[] }> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, tickets: true },
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      if (order.status === 'PAID') {
        return {
          issued: false,
          tickets: order.tickets.map((t) => ({ id: t.id, code: t.code })),
        };
      }

      // Conditional update — only one webhook delivery wins the race.
      const claim = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date() },
      });
      if (claim.count === 0) {
        const refreshed = await tx.order.findUnique({
          where: { id: orderId },
          include: { tickets: true },
        });
        return {
          issued: false,
          tickets: refreshed?.tickets.map((t) => ({ id: t.id, code: t.code })) ?? [],
        };
      }

      const created: { id: string; code: string }[] = [];
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { sold: { increment: item.quantity } },
        });
        for (let i = 0; i < item.quantity; i++) {
          const ticket = await tx.ticket.create({
            data: {
              orderId: order.id,
              ticketTypeId: item.ticketTypeId,
              code: generateTicketCode(),
            },
          });
          created.push({ id: ticket.id, code: ticket.code });
        }
      }
      return { issued: true, tickets: created };
    });
  }

  async scan(code: string, scannerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { code } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      if (ticket.status === TicketStatus.VOIDED) throw new BadRequestException('Ticket voided');

      const claim = await tx.ticket.updateMany({
        where: { id: ticket.id, status: TicketStatus.ISSUED },
        data: { status: TicketStatus.SCANNED, scannedAt: new Date(), scannedBy: scannerId },
      });
      if (claim.count === 0) {
        return { ok: false, reason: 'already_scanned' as const, ticket };
      }
      const scanned = await tx.ticket.findUniqueOrThrow({ where: { id: ticket.id } });
      return { ok: true as const, ticket: scanned };
    });
  }

  async findByCode(code: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { code },
      include: {
        order: { include: { event: true } },
        ticketType: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
