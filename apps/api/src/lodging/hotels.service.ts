import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalHotelOffer, HotelBedsClient } from './hotelbeds.client';

interface HotelResult {
  source: 'local' | 'hotelbeds';
  externalId?: string;
  rateKey?: string;
  slug?: string;
  name: string;
  city: string;
  category?: string;
  priceMinor: number;
  currency: string;
}

@Injectable()
export class HotelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelBeds: HotelBedsClient,
  ) {}

  /**
   * Merges local Hotel rows with HotelBeds availability. HotelBeds is
   * only queried when API keys are present *and* the caller supplied
   * the full search context (destinationCode + dates).
   */
  async search(params: {
    city?: string;
    destinationCode?: string;
    checkIn?: string;
    checkOut?: string;
  }): Promise<HotelResult[]> {
    const localPromise = this.prisma.hotel.findMany({
      where: {
        active: true,
        ...(params.city ? { city: { equals: params.city, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    const externalPromise: Promise<ExternalHotelOffer[]> =
      params.destinationCode && params.checkIn && params.checkOut && this.hotelBeds.isConfigured()
        ? this.hotelBeds.availability({
            destinationCode: params.destinationCode,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
          })
        : Promise.resolve([]);

    const [localRows, externalOffers] = await Promise.all([localPromise, externalPromise]);

    const local: HotelResult[] = localRows.map((h) => ({
      source: 'local',
      slug: h.slug,
      name: h.name,
      city: h.city,
      priceMinor: h.pricePerNightKobo,
      currency: 'NGN',
    }));
    const external: HotelResult[] = externalOffers.map((h) => ({
      source: 'hotelbeds',
      externalId: h.externalId,
      rateKey: h.rateKey,
      name: h.name,
      city: h.city,
      category: h.category,
      priceMinor: h.priceMinor,
      currency: h.currency,
    }));
    return [...local, ...external].sort((a, b) => a.name.localeCompare(b.name));
  }

  findBySlug(slug: string) {
    return this.prisma.hotel.findUniqueOrThrow({ where: { slug } });
  }

  async create(
    organizerSlug: string,
    input: {
      slug: string;
      name: string;
      description?: string;
      city: string;
      address: string;
      pricePerNightKobo: number;
      capacity: number;
    },
  ) {
    const organizer = await this.prisma.organizer.findUnique({ where: { slug: organizerSlug } });
    if (!organizer) throw new NotFoundException('Organizer not found');
    return this.prisma.hotel.create({ data: { organizerId: organizer.id, ...input } });
  }

  listForOrganizer(organizerSlug: string) {
    return this.prisma.hotel.findMany({
      where: { organizer: { slug: organizerSlug } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
