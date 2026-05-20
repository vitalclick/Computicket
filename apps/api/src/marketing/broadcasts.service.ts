import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mail/mailer.service';

@Injectable()
export class BroadcastsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async list(organizerSlug: string, eventSlug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug: eventSlug, organizer: { slug: organizerSlug } },
      select: { id: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return this.prisma.broadcast.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async send(
    organizerSlug: string,
    eventSlug: string,
    sentById: string,
    input: { subject: string; body: string },
  ) {
    const event = await this.prisma.event.findFirst({
      where: { slug: eventSlug, organizer: { slug: organizerSlug } },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Collect distinct paid-buyer emails for this event.
    const recipients = await this.prisma.order.findMany({
      where: { eventId: event.id, status: 'PAID' },
      select: { buyerEmail: true },
      distinct: ['buyerEmail'],
    });

    const broadcast = await this.prisma.broadcast.create({
      data: {
        eventId: event.id,
        sentById,
        subject: input.subject,
        body: input.body,
      },
    });

    let sent = 0;
    for (const r of recipients) {
      try {
        // Reuse the mailer's plain HTML path by wrapping the body.
        await this.mailer.sendBroadcast({
          to: r.buyerEmail,
          subject: input.subject,
          bodyText: input.body,
          eventTitle: event.title,
        });
        sent += 1;
      } catch {
        /* mailer logs failures itself */
      }
    }

    return this.prisma.broadcast.update({
      where: { id: broadcast.id },
      data: { sentCount: sent },
    });
  }
}
