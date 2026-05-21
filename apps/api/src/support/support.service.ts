import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodTool } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const MODEL = 'claude-haiku-4-5';
const SYSTEM_PROMPT = [
  'You are the Computicket Nigeria support assistant.',
  'Help buyers find their orders and tickets. Be brief and warm.',
  'Use the available tools to look up real data — never invent order IDs, ticket codes, prices, or refund status.',
  'Money is denominated in Naira; the API returns kobo (1 NGN = 100 kobo). Format prices like ₦12,500.',
  'If the user asks for something outside your tools (refunds, venue changes, etc.), tell them to email support@computicket.ng.',
].join(' ');

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly client: Anthropic | null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('ANTHROPIC_API_KEY not set; using deterministic keyword fallback.');
    }
  }

  async handleMessage(userId: string, message: string, history: ChatTurn[] = []) {
    const trimmed = (message ?? '').trim();
    if (!trimmed) return { reply: 'Tell me what you need help with — an order status, a ticket, anything.' };

    if (!this.client) {
      return { reply: await this.fallbackReply(userId, trimmed), fallback: true };
    }

    const tools = this.buildTools(userId);
    try {
      const runner = this.client.beta.messages.toolRunner({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: [
          ...history.map((t) => ({ role: t.role, content: t.content })),
          { role: 'user', content: trimmed },
        ],
      });
      const final = await runner.done();
      const text = final.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { type: string; text?: string }) => b.text ?? '')
        .join('\n')
        .trim();
      return { reply: text || 'Sorry, I couldn\'t produce a reply. Try rephrasing.' };
    } catch (err: unknown) {
      this.logger.error(`Anthropic call failed: ${err instanceof Error ? err.message : String(err)}`);
      return { reply: await this.fallbackReply(userId, trimmed), fallback: true };
    }
  }

  private buildTools(userId: string) {
    return [
      betaZodTool({
        name: 'list_my_orders',
        description: 'List the signed-in buyer\'s most recent orders, with totals and ticket counts.',
        inputSchema: z.object({
          limit: z.number().int().min(1).max(20).optional().describe('Max orders to return; defaults to 5.'),
        }),
        run: async ({ limit }) => {
          const take = limit ?? 5;
          const orders = await this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take,
            include: {
              event: { select: { title: true, startsAt: true, venue: true, city: true } },
              tickets: { select: { code: true, status: true } },
            },
          });
          return JSON.stringify(
            orders.map((o) => ({
              orderId: o.id,
              status: o.status,
              total: formatNaira(o.totalKobo),
              paystackRef: o.paystackRef,
              paidAt: o.paidAt,
              event: o.event,
              tickets: o.tickets,
            })),
          );
        },
      }),
      betaZodTool({
        name: 'get_ticket_qr',
        description: 'Return the QR check-in URL for one of the user\'s own tickets, by ticket code.',
        inputSchema: z.object({
          code: z.string().min(4).describe('The ticket code, e.g. CT-ABC123.'),
        }),
        run: async ({ code }) => {
          const ticket = await this.prisma.ticket.findUnique({
            where: { code },
            include: { order: { select: { userId: true } } },
          });
          if (!ticket) return JSON.stringify({ error: 'Ticket not found.' });
          if (ticket.order.userId !== userId) {
            return JSON.stringify({ error: 'That ticket belongs to a different account.' });
          }
          const base = process.env.PUBLIC_API_URL ?? 'http://localhost:4000/v1';
          return JSON.stringify({
            code: ticket.code,
            status: ticket.status,
            qrUrl: `${base}/tickets/${ticket.code}/qr.png`,
          });
        },
      }),
    ];
  }

  /**
   * Deterministic keyword fallback so the chat endpoint is useful in dev and
   * resilient if the Anthropic API is down. Looks for intent keywords and
   * answers from the database directly.
   */
  private async fallbackReply(userId: string, message: string): Promise<string> {
    const m = message.toLowerCase();
    const wantsOrders = /(order|booking|purchas|receipt|paid)/.test(m);
    const wantsTicket = /(ticket|qr|entry|scan)/.test(m);
    const wantsRefund = /(refund|cancel|chargeback)/.test(m);

    if (wantsRefund) {
      return 'Refunds are handled per event policy. Email support@computicket.ng with your order reference and we\'ll take it from there.';
    }
    if (wantsTicket) {
      const tickets = await this.prisma.ticket.findMany({
        where: { order: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { order: { select: { event: { select: { title: true } } } } },
      });
      if (tickets.length === 0) return 'You don\'t have any tickets on file yet.';
      const lines = tickets.map(
        (t) => `• ${t.order.event.title} — ${t.code} (${t.status})`,
      );
      return `Here are your most recent tickets:\n${lines.join('\n')}\n\nPresent the QR at the gate, or open it at /v1/tickets/<code>/qr.png.`;
    }
    if (wantsOrders) {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { event: { select: { title: true } } },
      });
      if (orders.length === 0) return 'You don\'t have any orders on file yet.';
      const lines = orders.map(
        (o) => `• ${o.event.title} — ${formatNaira(o.totalKobo)} (${o.status})`,
      );
      return `Here are your most recent orders:\n${lines.join('\n')}`;
    }
    return 'I can look up your orders, your tickets/QR codes, or point you to refunds. What do you need?';
  }
}
