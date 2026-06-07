import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { MailerService } from '../mail/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

const TRANSFER_TTL_HOURS = 72;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

@Injectable()
export class TicketTransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mailer: MailerService,
  ) {}

  /**
   * Create a one-time transfer link for a ticket the caller owns. The
   * plaintext token is returned exactly once (the DB stores its sha256);
   * any previous pending transfer for this ticket is cancelled so a
   * second "share" replaces the first.
   */
  async create(userId: string, code: string, recipientEmail?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { code },
      include: { order: { include: { event: { select: { title: true } } } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const currentOwner = ticket.ownerUserId ?? ticket.order.userId;
    if (currentOwner !== userId) {
      throw new ForbiddenException('You can only transfer tickets you own.');
    }
    if (ticket.status !== 'ISSUED') {
      throw new BadRequestException(
        `Cannot transfer a ${ticket.status.toLowerCase()} ticket.`,
      );
    }

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TRANSFER_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.ticketTransfer.updateMany({
        where: {
          ticketId: ticket.id,
          claimedAt: null,
          cancelledAt: null,
        },
        data: { cancelledAt: new Date() },
      });
      await tx.ticketTransfer.create({
        data: {
          ticketId: ticket.id,
          fromUserId: userId,
          recipientEmail: recipientEmail?.toLowerCase() ?? null,
          tokenHash,
          expiresAt,
        },
      });
    });

    await this.audit.record({
      actorUserId: userId,
      action: 'ticket.transfer.created',
      targetType: 'Ticket',
      targetId: ticket.id,
      metadata: { code, recipientEmail: recipientEmail ?? null },
    });

    if (recipientEmail) {
      const link = `${process.env.WEB_APP_URL ?? 'https://computicket.ng'}/transfer/${token}`;
      void this.mailer
        .sendTicketTransferInvite({
          to: recipientEmail,
          eventTitle: ticket.order.event.title,
          link,
          expiresAt,
        })
        .catch(() => undefined);
    }

    return {
      token,
      expiresAt,
      // Render-ready link for the UI to copy.
      link: `${process.env.WEB_APP_URL ?? 'https://computicket.ng'}/transfer/${token}`,
    };
  }

  /**
   * Describe the transfer without consuming it — used to render the
   * landing page before the recipient hits "Accept". Does not require
   * a signed-in user.
   */
  async describe(token: string) {
    const tokenHash = hashToken(token);
    const transfer = await this.prisma.ticketTransfer.findUnique({
      where: { tokenHash },
      include: {
        ticket: {
          include: {
            ticketType: { select: { name: true } },
            order: {
              include: {
                event: {
                  select: {
                    title: true,
                    venue: true,
                    city: true,
                    startsAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!transfer) throw new NotFoundException('Transfer link not found.');
    const state = this.stateOf(transfer);
    return {
      state,
      expiresAt: transfer.expiresAt,
      recipientEmail: transfer.recipientEmail,
      ticket: {
        code: transfer.ticket.code,
        ticketTypeName: transfer.ticket.ticketType.name,
        event: transfer.ticket.order.event,
      },
    };
  }

  /**
   * Claim a transfer. Atomically:
   *  - marks the TicketTransfer claimed,
   *  - flips Ticket.ownerUserId to the caller,
   *  - voids any other pending transfers on the same ticket.
   * Idempotent: a second call by the same user returns the same OK
   * state; a second call by a different user errors.
   */
  async claim(userId: string, token: string) {
    const tokenHash = hashToken(token);
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.ticketTransfer.findUnique({
        where: { tokenHash },
        include: {
          ticket: {
            include: {
              order: { include: { event: { select: { title: true } } } },
            },
          },
        },
      });
      if (!transfer) throw new NotFoundException('Transfer link not found.');
      if (transfer.cancelledAt) {
        throw new BadRequestException('This transfer has been cancelled.');
      }
      if (transfer.expiresAt < new Date()) {
        throw new BadRequestException('This transfer link has expired.');
      }
      if (transfer.claimedAt) {
        if (transfer.claimedByUserId === userId) {
          // Idempotent — return the same successful state.
          return { ticketCode: transfer.ticket.code, alreadyClaimed: true };
        }
        throw new BadRequestException('This transfer has already been claimed.');
      }
      if (transfer.fromUserId === userId) {
        throw new BadRequestException('You can\'t claim a transfer to yourself.');
      }
      if (transfer.ticket.status !== 'ISSUED') {
        throw new BadRequestException(
          `Cannot accept a ${transfer.ticket.status.toLowerCase()} ticket.`,
        );
      }

      const now = new Date();
      const claim = await tx.ticketTransfer.updateMany({
        where: { id: transfer.id, claimedAt: null, cancelledAt: null },
        data: { claimedAt: now, claimedByUserId: userId },
      });
      if (claim.count === 0) {
        throw new BadRequestException('This transfer is no longer available.');
      }
      await tx.ticket.update({
        where: { id: transfer.ticketId },
        data: { ownerUserId: userId, nftClaimedWallet: null, nftClaimedAt: null },
      });
      // Cancel any other open transfer attempts on this ticket so the
      // outgoing owner can't claw it back via a previous unclaimed link.
      await tx.ticketTransfer.updateMany({
        where: {
          ticketId: transfer.ticketId,
          id: { not: transfer.id },
          claimedAt: null,
          cancelledAt: null,
        },
        data: { cancelledAt: now },
      });

      await this.audit.record({
        actorUserId: userId,
        action: 'ticket.transfer.claimed',
        targetType: 'Ticket',
        targetId: transfer.ticketId,
        metadata: { fromUserId: transfer.fromUserId, code: transfer.ticket.code },
      });

      return {
        ticketCode: transfer.ticket.code,
        eventTitle: transfer.ticket.order.event.title,
        alreadyClaimed: false,
      };
    });
  }

  async cancel(userId: string, code: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { code } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const owner = ticket.ownerUserId ?? null;
    if (owner !== userId) {
      throw new ForbiddenException('Only the current owner can cancel a transfer.');
    }
    const res = await this.prisma.ticketTransfer.updateMany({
      where: { ticketId: ticket.id, claimedAt: null, cancelledAt: null },
      data: { cancelledAt: new Date() },
    });
    if (res.count > 0) {
      await this.audit.record({
        actorUserId: userId,
        action: 'ticket.transfer.cancelled',
        targetType: 'Ticket',
        targetId: ticket.id,
        metadata: { code },
      });
    }
    return { cancelled: res.count };
  }

  /** State of a transfer for the describe-by-token view. */
  private stateOf(t: {
    expiresAt: Date;
    claimedAt: Date | null;
    cancelledAt: Date | null;
  }): 'pending' | 'expired' | 'claimed' | 'cancelled' {
    if (t.cancelledAt) return 'cancelled';
    if (t.claimedAt) return 'claimed';
    if (t.expiresAt < new Date()) return 'expired';
    return 'pending';
  }
}
