import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizerMemberGuard } from '../auth/organizer-member.guard';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookDispatcher } from './webhook-dispatcher.service';

@ApiTags('webhook-deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizerMemberGuard)
@Controller('dashboard/organizers/:organizerSlug/webhook-deliveries')
export class WebhookDeliveriesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: WebhookDispatcher,
  ) {}

  @Get()
  async list(@Param('organizerSlug') organizerSlug: string) {
    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: { endpoint: { organizer: { slug: organizerSlug } } },
      orderBy: { createdAt: 'desc' },
      include: { endpoint: { select: { url: true, id: true } } },
      take: 100,
    });
    return deliveries.map((d) => ({
      id: d.id,
      event: d.event,
      eventId: d.eventId,
      status: d.status,
      attemptCount: d.attemptCount,
      lastAttemptAt: d.lastAttemptAt,
      nextAttemptAt: d.nextAttemptAt,
      responseStatus: d.responseStatus,
      createdAt: d.createdAt,
      endpoint: d.endpoint,
    }));
  }

  @Post(':id/retry')
  async retry(@Param('organizerSlug') organizerSlug: string, @Param('id') id: string) {
    const d = await this.prisma.webhookDelivery.findFirst({
      where: { id, endpoint: { organizer: { slug: organizerSlug } } },
      include: { endpoint: true },
    });
    if (!d) return { retried: false };
    const ok = await this.dispatcher.attempt(
      d.id,
      d.endpoint.url,
      d.payload,
      d.signature,
      d.event,
      d.eventId,
    );
    return { retried: true, ok };
  }
}
