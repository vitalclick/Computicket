import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const TIMEOUT_MS = 5000;
const USER_AGENT = 'Computicket-Webhooks/1.0';

// Backoff schedule in milliseconds, indexed by attemptCount AFTER the next
// attempt. attemptCount=1 -> 1 min, 2 -> 5 min, 3 -> 30 min, 4 -> 2h, 5 -> 8h,
// 6 -> 24h. Past 6 we give up.
const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3600_000, 8 * 3600_000, 24 * 3600_000];
const MAX_ATTEMPTS = BACKOFF_MS.length;

interface DispatchInput {
  organizerId: string;
  event: 'order.paid' | 'order.refunded' | 'ticket.scanned';
  data: Record<string, unknown>;
}

@Injectable()
export class WebhookDispatcher {
  private readonly logger = new Logger(WebhookDispatcher.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueue a delivery to every active endpoint subscribed to this event,
   * then attempt each one immediately. Failures are persisted with a
   * backoff schedule; the cron in WebhookRetryService picks them up later.
   */
  async dispatch(input: DispatchInput): Promise<{ enqueued: number; deliveredNow: number }> {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        organizerId: input.organizerId,
        active: true,
        eventTypes: { has: input.event },
      },
    });
    if (endpoints.length === 0) return { enqueued: 0, deliveredNow: 0 };

    const eventId = `evt_${randomBytes(12).toString('hex')}`;
    const payload = JSON.stringify({
      id: eventId,
      event: input.event,
      createdAt: new Date().toISOString(),
      data: input.data,
    });

    // Persist a delivery row per endpoint, then attempt each.
    const deliveries = await Promise.all(
      endpoints.map((endpoint) => {
        const signature = createHmac('sha256', endpoint.signingSecret).update(payload).digest('hex');
        return this.prisma.webhookDelivery.create({
          data: {
            endpointId: endpoint.id,
            event: input.event,
            eventId,
            payload,
            signature,
          },
        });
      }),
    );

    let deliveredNow = 0;
    await Promise.all(
      deliveries.map(async (d, i) => {
        const endpoint = endpoints[i];
        if (!endpoint) return;
        const ok = await this.attempt(d.id, endpoint.url, payload, d.signature, input.event, eventId);
        if (ok) deliveredNow += 1;
      }),
    );

    return { enqueued: deliveries.length, deliveredNow };
  }

  /**
   * Attempt a single delivery. On success marks DELIVERED. On failure
   * either schedules the next retry or marks FAILED if max attempts
   * reached. Used by both the immediate path and the retry cron.
   */
  async attempt(
    deliveryId: string,
    url: string,
    payload: string,
    signature: string,
    event: string,
    eventId: string,
  ): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let status: number | undefined;
    let body: string | undefined;
    let ok = false;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': USER_AGENT,
          'x-computicket-event': event,
          'x-computicket-event-id': eventId,
          'x-computicket-signature': signature,
        },
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timer);
      status = res.status;
      body = (await res.text()).slice(0, 8000); // cap stored body
      ok = res.ok;
    } catch (e) {
      clearTimeout(timer);
      body = (e as Error).message;
    }

    const next = await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: ok
        ? {
            status: 'DELIVERED',
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date(),
            responseStatus: status,
            responseBody: body,
          }
        : {
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date(),
            responseStatus: status,
            responseBody: body,
          },
    });

    if (!ok) {
      const attempts = next.attemptCount;
      if (attempts >= MAX_ATTEMPTS) {
        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: { status: 'FAILED' },
        });
        this.logger.warn(`Webhook delivery ${deliveryId} exhausted ${MAX_ATTEMPTS} attempts; marking FAILED`);
      } else {
        const backoff = BACKOFF_MS[attempts - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1]!;
        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: { nextAttemptAt: new Date(Date.now() + backoff) },
        });
      }
    }

    return ok;
  }
}
