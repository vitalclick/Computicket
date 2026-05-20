import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async listEventOrders(organizerSlug: string, eventSlug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug: eventSlug, organizer: { slug: organizerSlug } },
      select: { id: true, slug: true, title: true },
    });
    if (!event) throw new NotFoundException(`Event "${eventSlug}" not found`);

    const orders = await this.prisma.order.findMany({
      where: { eventId: event.id, status: { in: ['PAID', 'REFUNDED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { ticketType: { select: { name: true } } } },
        _count: { select: { tickets: true } },
      },
      take: 200,
    });

    return {
      event,
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        buyerEmail: o.buyerEmail,
        buyerName: o.buyerName,
        totalKobo: o.totalKobo,
        paystackRef: o.paystackRef,
        paidAt: o.paidAt,
        ticketCount: o._count.tickets,
        items: o.items.map((it) => ({
          ticketTypeName: it.ticketType.name,
          quantity: it.quantity,
          unitPriceKobo: it.unitPriceKobo,
        })),
      })),
    };
  }

  async organizerOverview(organizerSlug: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug: organizerSlug },
      include: {
        events: {
          orderBy: { startsAt: 'asc' },
          include: {
            ticketTypes: { orderBy: { position: 'asc' } },
          },
        },
      },
    });
    if (!organizer) throw new NotFoundException(`Organizer "${organizerSlug}" not found`);

    // Per-event paid revenue and tickets sold.
    const aggregates = await this.prisma.order.groupBy({
      by: ['eventId'],
      where: { status: 'PAID', event: { organizerId: organizer.id } },
      _sum: { totalKobo: true },
      _count: { _all: true },
    });
    const aggByEvent = new Map(
      aggregates.map((a) => [
        a.eventId,
        { revenueKobo: a._sum.totalKobo ?? 0, paidOrders: a._count._all },
      ]),
    );

    return {
      organizer: {
        id: organizer.id,
        slug: organizer.slug,
        name: organizer.name,
        status: organizer.status,
        description: organizer.description,
      },
      events: organizer.events.map((e) => {
        const capacity = e.ticketTypes.reduce((acc, t) => acc + t.capacity, 0);
        const sold = e.ticketTypes.reduce((acc, t) => acc + t.sold, 0);
        const held = e.ticketTypes.reduce((acc, t) => acc + t.held, 0);
        const agg = aggByEvent.get(e.id) ?? { revenueKobo: 0, paidOrders: 0 };
        return {
          id: e.id,
          slug: e.slug,
          title: e.title,
          venue: e.venue,
          city: e.city,
          startsAt: e.startsAt,
          status: e.status,
          capacity,
          sold,
          held,
          revenueKobo: agg.revenueKobo,
          paidOrders: agg.paidOrders,
          ticketTypes: e.ticketTypes.map((t) => ({
            id: t.id,
            name: t.name,
            priceKobo: t.priceKobo,
            capacity: t.capacity,
            sold: t.sold,
            held: t.held,
          })),
        };
      }),
    };
  }
}
