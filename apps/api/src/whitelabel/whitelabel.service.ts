import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@computicket/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhitelabelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public lookup used by the white-label front-end middleware. Returns
   * the organizer (with branding) and their published events for a given
   * slug. If the slug is null, returns null instead of throwing so
   * middleware can fall through to the default marketplace.
   */
  async forSlug(slug: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug },
      select: {
        slug: true, name: true, description: true, logoUrl: true,
        website: true, customDomain: true, brandColor: true, status: true,
      },
    });
    if (!organizer) throw new NotFoundException('Organizer not found');
    if (organizer.status !== 'APPROVED') throw new NotFoundException('Organizer not active');
    const events = await this.prisma.event.findMany({
      where: { organizer: { slug }, status: 'PUBLISHED', type: 'EVENT' },
      orderBy: { startsAt: 'asc' },
      include: { ticketTypes: { orderBy: { position: 'asc' } } },
      take: 50,
    });
    return { organizer, events };
  }

  async resolveByHost(host: string) {
    const cleaned = host.split(':')[0]?.toLowerCase();
    if (!cleaned) return null;
    const organizer = await this.prisma.organizer.findUnique({
      where: { customDomain: cleaned },
      select: { slug: true, name: true, customDomain: true },
    });
    return organizer ?? null;
  }

  async setCustomDomain(organizerSlug: string, input: { customDomain: string; brandColor?: string }) {
    const normalised = input.customDomain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalised)) {
      throw new BadRequestException('customDomain must look like a hostname (e.g. tickets.example.com)');
    }
    if (input.brandColor && !/^#[0-9a-fA-F]{6}$/.test(input.brandColor)) {
      throw new BadRequestException('brandColor must be a #RRGGBB hex value');
    }
    try {
      return await this.prisma.organizer.update({
        where: { slug: organizerSlug },
        data: { customDomain: normalised, brandColor: input.brandColor },
        select: { slug: true, customDomain: true, brandColor: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Custom domain already in use by another organizer');
      }
      throw e;
    }
  }
}
