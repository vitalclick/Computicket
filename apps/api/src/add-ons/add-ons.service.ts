import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddOnsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForEvent(eventSlug: string) {
    return this.prisma.addOn.findMany({
      where: { event: { slug: eventSlug }, active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        priceKobo: true,
        capacity: true,
        sold: true,
      },
    });
  }

  async listForOrganizer(organizerSlug: string) {
    return this.prisma.addOn.findMany({
      where: { event: { organizer: { slug: organizerSlug } } },
      orderBy: { createdAt: 'desc' },
      include: { event: { select: { slug: true, title: true } } },
    });
  }

  async create(
    organizerSlug: string,
    input: { eventSlug: string; name: string; description?: string; priceKobo: number; capacity?: number },
  ) {
    const event = await this.prisma.event.findFirst({
      where: { slug: input.eventSlug, organizer: { slug: organizerSlug } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return this.prisma.addOn.create({
      data: {
        eventId: event.id,
        name: input.name,
        description: input.description,
        priceKobo: input.priceKobo,
        capacity: input.capacity,
      },
    });
  }

  async deactivate(organizerSlug: string, id: string) {
    const updated = await this.prisma.addOn.updateMany({
      where: { id, event: { organizer: { slug: organizerSlug } } },
      data: { active: false },
    });
    if (updated.count === 0) throw new NotFoundException('Add-on not found');
    return { id, active: false };
  }
}
