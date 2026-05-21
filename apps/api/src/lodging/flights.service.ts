import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DuffelClient, ExternalFlightOffer } from './duffel.client';

interface FlightResult {
  source: 'local' | 'duffel';
  externalId?: string;
  flightNumber: string;
  airline: string;
  fromAirport: string;
  toAirport: string;
  departsAt: Date;
  arrivesAt: Date;
  priceKobo: number;
  currency?: string;
}

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duffel: DuffelClient,
  ) {}

  /**
   * Returns local Flight rows merged with Duffel offers (when
   * DUFFEL_API_KEY is set and the query has from + to + date). Duffel
   * calls fall back gracefully on any error — the caller never sees
   * worse than the pre-existing local-only behaviour.
   */
  async search(params: { from?: string; to?: string; date?: string }): Promise<FlightResult[]> {
    const dayStart = params.date ? new Date(`${params.date}T00:00:00Z`) : new Date();
    const dayEnd = params.date
      ? new Date(`${params.date}T23:59:59.999Z`)
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // next 30 days

    const localPromise = this.prisma.flight.findMany({
      where: {
        active: true,
        departsAt: { gte: dayStart, lte: dayEnd },
        ...(params.from ? { fromAirport: { equals: params.from, mode: 'insensitive' } } : {}),
        ...(params.to ? { toAirport: { equals: params.to, mode: 'insensitive' } } : {}),
      },
      orderBy: { departsAt: 'asc' },
      take: 100,
    });

    const externalPromise: Promise<ExternalFlightOffer[]> =
      params.from && params.to && params.date && this.duffel.isConfigured()
        ? this.duffel.searchOneWay({ from: params.from, to: params.to, date: params.date })
        : Promise.resolve([]);

    const [localRows, externalOffers] = await Promise.all([localPromise, externalPromise]);

    const local: FlightResult[] = localRows.map((f) => ({
      source: 'local',
      flightNumber: f.flightNumber,
      airline: f.airline,
      fromAirport: f.fromAirport,
      toAirport: f.toAirport,
      departsAt: f.departsAt,
      arrivesAt: f.arrivesAt,
      priceKobo: f.priceKobo,
      currency: 'NGN',
    }));
    const external: FlightResult[] = externalOffers.map((o) => ({
      source: 'duffel',
      externalId: o.externalId,
      flightNumber: o.flightNumber,
      airline: o.carrier,
      fromAirport: o.fromAirport,
      toAirport: o.toAirport,
      departsAt: o.departsAt,
      arrivesAt: o.arrivesAt,
      priceKobo: o.priceKobo,
      currency: o.currency,
    }));
    return [...local, ...external].sort(
      (a, b) => a.departsAt.getTime() - b.departsAt.getTime(),
    );
  }

  async create(
    organizerSlug: string,
    input: {
      flightNumber: string;
      airline: string;
      fromAirport: string;
      toAirport: string;
      departsAt: string;
      arrivesAt: string;
      priceKobo: number;
      capacity: number;
    },
  ) {
    const organizer = await this.prisma.organizer.findUnique({ where: { slug: organizerSlug } });
    if (!organizer) throw new NotFoundException('Organizer not found');
    return this.prisma.flight.create({
      data: {
        organizerId: organizer.id,
        ...input,
        departsAt: new Date(input.departsAt),
        arrivesAt: new Date(input.arrivesAt),
      },
    });
  }

  listForOrganizer(organizerSlug: string) {
    return this.prisma.flight.findMany({
      where: { organizer: { slug: organizerSlug } },
      orderBy: { departsAt: 'asc' },
    });
  }
}
