import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const PLAYBACK_TTL_SECONDS = 600; // 10 minutes

@Injectable()
export class StreamingService {
  constructor(private readonly prisma: PrismaService) {}

  async setStream(
    organizerSlug: string,
    eventSlug: string,
    input: { streamUrl?: string | null; isLive?: boolean },
  ) {
    const event = await this.prisma.event.findFirst({
      where: { slug: eventSlug, organizer: { slug: organizerSlug } },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (input.streamUrl && !/^https?:\/\//.test(input.streamUrl)) {
      throw new BadRequestException('streamUrl must be http(s)');
    }
    if (input.isLive && !(input.streamUrl ?? event.streamUrl)) {
      throw new BadRequestException('Cannot go live without a streamUrl');
    }
    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        streamUrl: input.streamUrl ?? event.streamUrl,
        isLive: input.isLive ?? event.isLive,
      },
      select: { slug: true, streamUrl: true, isLive: true },
    });
  }

  /**
   * Return the playback URL for a ticket holder. Validates the ticket
   * exists, is not voided, and the event is currently live. Returns a
   * short-lived signed token bound to the ticket so abuse can be traced.
   */
  async playback(code: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { code },
      include: {
        order: {
          include: {
            event: { select: { id: true, title: true, streamUrl: true, isLive: true } },
          },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === 'VOIDED') {
      throw new ForbiddenException('Voided ticket cannot watch the stream');
    }
    const event = ticket.order.event;
    if (!event.isLive || !event.streamUrl) {
      throw new ForbiddenException('Stream is not currently live');
    }

    const exp = Math.floor(Date.now() / 1000) + PLAYBACK_TTL_SECONDS;
    const secret = process.env.STREAMING_SECRET ?? process.env.JWT_SECRET ?? 'dev_unsafe';
    const payload = `${ticket.id}.${exp}`;
    const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
    const playbackToken = `${payload}.${sig}`;

    return {
      eventTitle: event.title,
      streamUrl: event.streamUrl,
      playbackToken,
      expiresAt: new Date(exp * 1000),
    };
  }
}
