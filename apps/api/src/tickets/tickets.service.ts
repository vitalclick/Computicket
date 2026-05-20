import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@computicket/db';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async scan(code: string, scannerId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { code },
      include: { order: { include: { event: true } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === TicketStatus.VOIDED) throw new BadRequestException('Ticket voided');
    if (ticket.status === TicketStatus.SCANNED) {
      return { ok: false, reason: 'already_scanned', ticket };
    }

    const scanned = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.SCANNED, scannedAt: new Date(), scannedBy: scannerId },
    });

    return { ok: true, ticket: scanned };
  }
}
