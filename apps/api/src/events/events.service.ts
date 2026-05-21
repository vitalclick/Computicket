import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus, EventType } from '@computicket/db';

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
  type?: EventType;
  busRouteId?: string;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEventInput) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug: input.organizerSlug },
    });
    if (!organizer) throw new NotFoundException(`Organizer "${input.organizerSlug}" not found`);

    if (input.busRouteId) {
      const route = await this.prisma.busRoute.findUnique({
        where: { id: input.busRouteId },
      });
      if (!route || route.organizerId !== organizer.id) {
        throw new BadRequestException('Bus route not found for this organizer');
      }
    }

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
        type: input.type ?? 'EVENT',
        busRouteId: input.busRouteId,
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
        type: 'EVENT',
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

  /**
   * Typo-tolerant search across event title, venue, and city using
   * Postgres trigram similarity (pg_trgm). Falls back to a simple ILIKE
   * when the query is too short for the trigram index to be selective.
   * Only PUBLISHED events of type EVENT are returned.
   */
  async search(params: { q: string; city?: string; limit?: number }) {
    const q = (params.q ?? '').trim();
    if (!q) return [];
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
    const cityFilter = params.city ? params.city.trim() : null;
    const pattern = `%${q.toLowerCase()}%`;

    // Combined similarity score across title/venue/city, weighted toward title.
    // word_similarity() scores the query against the closest substring of
    // the target rather than the whole string, so "davdo" still matches
    // "Davido — Timeless Tour Lagos" cleanly. ILIKE handles the
    // case where the query is a clean substring (short tokens like "eko").
    const rows = await this.prisma.$queryRaw<Array<{
      id: string;
      score: number;
    }>>(Prisma.sql`
      SELECT e."id",
             (
               word_similarity(lower(${q}), lower(e."title")) * 2.0 +
               word_similarity(lower(${q}), lower(e."venue")) +
               word_similarity(lower(${q}), lower(e."city"))
             ) AS score
      FROM "Event" e
      WHERE e."status" = 'PUBLISHED'
        AND e."type" = 'EVENT'
        AND (
          word_similarity(lower(${q}), lower(e."title")) > 0.3 OR
          word_similarity(lower(${q}), lower(e."venue")) > 0.3 OR
          word_similarity(lower(${q}), lower(e."city"))  > 0.3 OR
          lower(e."title") LIKE ${pattern} OR
          lower(e."venue") LIKE ${pattern} OR
          lower(e."city")  LIKE ${pattern}
        )
        ${cityFilter ? Prisma.sql`AND lower(e."city") = lower(${cityFilter})` : Prisma.empty}
      ORDER BY score DESC, e."startsAt" ASC
      LIMIT ${limit}
    `);

    if (rows.length === 0) return [];
    const events = await this.prisma.event.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: {
        organizer: { select: { slug: true, name: true } },
        ticketTypes: { orderBy: { position: 'asc' } },
      },
    });
    // Preserve similarity ordering — Prisma `in` doesn't guarantee it.
    const order = new Map(rows.map((r, i) => [r.id, i]));
    return events.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { slug: true, name: true, description: true } },
        ticketTypes: { orderBy: { position: 'asc' } },
        busRoute: true,
      },
    });
    if (!event) throw new NotFoundException(`Event "${slug}" not found`);
    return event;
  }

  async publish(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { organizer: { select: { status: true } } },
    });
    if (!event) throw new NotFoundException(`Event "${slug}" not found`);
    if (event.organizer.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Organizer must be APPROVED by platform admin before publishing events',
      );
    }
    return this.prisma.event.update({
      where: { slug },
      data: { status: EventStatus.PUBLISHED },
    });
  }
}
