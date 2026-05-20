import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@computicket/db';

interface CreateEventInput {
  organizerSlug: string;
  slug: string;
  title: string;
  description?: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  ticketTypes: Array<{ name: string; priceKobo: number; capacity: number }>;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEventInput) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug: input.organizerSlug },
    });
    if (!organizer) throw new NotFoundException(`Organizer "${input.organizerSlug}" not found`);

    return this.prisma.event.create({
      data: {
        organizerId: organizer.id,
        slug: input.slug,
        title: input.title,
        description: input.description,
        venue: input.venue,
        city: input.city,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        status: EventStatus.DRAFT,
        ticketTypes: {
          create: input.ticketTypes.map((tt, i) => ({ ...tt, position: i + 1 })),
        },
      },
      include: { ticketTypes: true },
    });
  }

  listPublished(params: { city?: string; cursor?: string; limit?: number }) {
    return this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        ...(params.city ? { city: { equals: params.city, mode: 'insensitive' } } : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: params.limit ?? 20,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: {
        organizer: { select: { slug: true, name: true } },
        ticketTypes: { orderBy: { position: 'asc' } },
      },
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { slug: true, name: true, description: true } },
        ticketTypes: { orderBy: { position: 'asc' } },
      },
    });
    if (!event) throw new NotFoundException(`Event "${slug}" not found`);
    return event;
  }

  async publish(slug: string) {
    return this.prisma.event.update({
      where: { slug },
      data: { status: EventStatus.PUBLISHED },
    });
  }
}
