import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@computicket/db';
import { SeatingService } from '../seating/seating.service';

const SCAN_ROLES = new Set(['OWNER', 'MANAGER', 'SCANNER']);

function generateTicketCode(): string {
  // 16 alphanumeric chars; collision space ≈ 36^16 ≈ 8e24
  return `TKT-${randomBytes(10).toString('base64url').toUpperCase().slice(0, 16)}`;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seating: SeatingService,
  ) {}

  /**
   * Issue tickets for an order that has already been marked PAID (wallet
   * path). Releases held inventory, increments sold, creates one ticket
   * per quantity. Idempotent if tickets already exist.
   */
  async issueAndReleaseHolds(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, tickets: true },
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);
      if (order.tickets.length > 0) {
        return { issued: false, tickets: order.tickets.map((t) => ({ id: t.id, code: t.code })) };
      }
      const created: { id: string; code: string }[] = [];
      const byType: Array<{ ticketTypeId: string; ticketIds: string[] }> = [];
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            sold: { increment: item.quantity },
            held: { decrement: item.quantity },
          },
        });
        const ids: string[] = [];
        for (let i = 0; i < item.quantity; i++) {
          const ticket = await tx.ticket.create({
            data: {
              orderId: order.id,
              ticketTypeId: item.ticketTypeId,
              code: generateTicketCode(),
              ownerUserId: order.userId,
            },
          });
          created.push({ id: ticket.id, code: ticket.code });
          ids.push(ticket.id);
        }
        byType.push({ ticketTypeId: item.ticketTypeId, ticketIds: ids });
      }
      await this.seating.sellHeldSeats(tx, order.id, byType);
      return { issued: true, tickets: created };
    });
  }

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
      const byType: Array<{ ticketTypeId: string; ticketIds: string[] }> = [];
      for (const item of order.items) {
        // Convert the hold into a sale: held -= qty, sold += qty.
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            sold: { increment: item.quantity },
            held: { decrement: item.quantity },
          },
        });
        const ids: string[] = [];
        for (let i = 0; i < item.quantity; i++) {
          const ticket = await tx.ticket.create({
            data: {
              orderId: order.id,
              ticketTypeId: item.ticketTypeId,
              code: generateTicketCode(),
              ownerUserId: order.userId,
            },
          });
          created.push({ id: ticket.id, code: ticket.code });
          ids.push(ticket.id);
        }
        byType.push({ ticketTypeId: item.ticketTypeId, ticketIds: ids });
      }
      await this.seating.sellHeldSeats(tx, order.id, byType);
      return { issued: true, tickets: created };
    });
  }

  async scan(code: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { code },
        include: {
          order: { include: { event: { select: { organizerId: true, title: true } } } },
          ticketType: { select: { name: true } },
        },
      });
      if (!ticket) throw new NotFoundException('Ticket not found');

      const membership = await tx.organizerMember.findFirst({
        where: { userId, organizerId: ticket.order.event.organizerId },
        select: { role: true },
      });
      if (!membership || !SCAN_ROLES.has(membership.role)) {
        throw new ForbiddenException('Not authorised to scan tickets for this event');
      }

      if (ticket.status === TicketStatus.VOIDED) {
        return {
          ok: false as const,
          reason: 'voided' as const,
          ticket: this.publicTicket(ticket),
        };
      }

      const claim = await tx.ticket.updateMany({
        where: { id: ticket.id, status: TicketStatus.ISSUED },
        data: { status: TicketStatus.SCANNED, scannedAt: new Date(), scannedBy: userId },
      });
      if (claim.count === 0) {
        return {
          ok: false as const,
          reason: 'already_scanned' as const,
          ticket: this.publicTicket(ticket),
        };
      }
      const scanned = await tx.ticket.findUniqueOrThrow({ where: { id: ticket.id } });
      return {
        ok: true as const,
        ticket: { ...this.publicTicket(ticket), status: scanned.status, scannedAt: scanned.scannedAt },
      };
    });
  }

  private publicTicket(t: {
    id: string;
    code: string;
    status: TicketStatus;
    scannedAt: Date | null;
    order: { event: { title: string } };
    ticketType: { name: string };
  }) {
    return {
      id: t.id,
      code: t.code,
      status: t.status,
      scannedAt: t.scannedAt,
      ticketTypeName: t.ticketType.name,
      eventTitle: t.order.event.title,
    };
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
