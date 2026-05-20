import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookDispatcher } from './webhook-dispatcher.service';

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: WebhookDispatcher,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runScheduled() {
    const due = await this.prisma.webhookDelivery.findMany({
      where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
      include: { endpoint: true },
      take: 50,
      orderBy: { nextAttemptAt: 'asc' },
    });
    if (due.length === 0) return;
    this.logger.log(`Retrying ${due.length} due deliveries`);
    for (const d of due) {
      await this.dispatcher.attempt(
        d.id,
        d.endpoint.url,
        d.payload,
        d.signature,
        d.event,
        d.eventId,
      );
    }
  }
}
