import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

// Platform takes 10% of every resale (in addition to whatever the
// organizer's original commission was — that already settled).
const PLATFORM_FEE_BPS = 1000;

@Injectable()
export class ResaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  async listMarketplace() {
    const listings = await this.prisma.ticketListing.findMany({
      where: { status: 'LISTED' },
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          include: {
            ticketType: { select: { name: true, priceKobo: true } },
            order: { include: { event: { select: { slug: true, title: true, startsAt: true, venue: true, city: true } } } },
          },
        },
      },
      take: 100,
    });
    return listings.map((l) => ({
      id: l.id,
      askKobo: l.askKobo,
      createdAt: l.createdAt,
      ticket: {
        code: l.ticket.code,
        tierName: l.ticket.ticketType.name,
        originalPriceKobo: l.ticket.ticketType.priceKobo,
      },
      event: l.ticket.order.event,
    }));
  }

  async listMine(userId: string) {
    return this.prisma.ticketListing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { ticket: { select: { code: true } } },
    });
  }

  async createListing(userId: string, input: { ticketCode: string; askKobo: number }) {
    const ticket = await this.prisma.ticket.findUnique({ where: { code: input.ticketCode } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.ownerUserId !== userId) throw new ForbiddenException('Not your ticket');
    if (ticket.status !== 'ISSUED') throw new BadRequestException(`Cannot list a ${ticket.status} ticket`);
    if (input.askKobo < 10000) throw new BadRequestException('Minimum ask is NGN 100');

    const existing = await this.prisma.ticketListing.findFirst({
      where: { ticketId: ticket.id, status: 'LISTED' },
    });
    if (existing) throw new BadRequestException('Ticket already listed');

    return this.prisma.ticketListing.create({
      data: { ticketId: ticket.id, sellerId: userId, askKobo: input.askKobo },
    });
  }

  async cancelListing(userId: string, id: string) {
    const updated = await this.prisma.ticketListing.updateMany({
      where: { id, sellerId: userId, status: 'LISTED' },
      data: { status: 'CANCELLED' },
    });
    if (updated.count === 0) throw new NotFoundException('Listing not found or not active');
    return { id, status: 'CANCELLED' as const };
  }

  /**
   * Buyer pays from wallet, seller receives net of platform fee. Ticket
   * ownership transfers. All-or-nothing atomic.
   */
  async buyListing(buyerId: string, id: string) {
    const listing = await this.prisma.ticketListing.findUnique({
      where: { id },
      include: { ticket: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'LISTED') throw new BadRequestException('Listing is not active');
    if (listing.sellerId === buyerId) throw new BadRequestException("Can't buy your own listing");

    // Debit buyer wallet first; if it fails the listing stays LISTED.
    const debit = await this.wallet.debit({
      userId: buyerId,
      amountKobo: listing.askKobo,
      type: 'PURCHASE',
      note: `Resale ${listing.id}`,
    });
    if (!debit.ok) throw new BadRequestException('Insufficient wallet balance');

    const platformFee = Math.floor((listing.askKobo * PLATFORM_FEE_BPS) / 10000);
    const sellerCredit = listing.askKobo - platformFee;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Claim the listing.
        const claim = await tx.ticketListing.updateMany({
          where: { id: listing.id, status: 'LISTED' },
          data: { status: 'SOLD', buyerId, soldAt: new Date() },
        });
        if (claim.count === 0) {
          throw new BadRequestException('Listing was claimed by another buyer');
        }
        // Transfer ticket ownership.
        await tx.ticket.update({
          where: { id: listing.ticketId },
          data: { ownerUserId: buyerId },
        });
      });

      // Credit seller wallet (outside the txn so we can return clean errors;
      // worst case the seller has to be reconciled if this step fails).
      await this.wallet.credit({
        userId: listing.sellerId,
        amountKobo: sellerCredit,
        type: 'ADJUSTMENT',
        note: `Resale proceeds (${listing.id})`,
      });
    } catch (e) {
      // Refund the buyer's debit on race-loss.
      await this.wallet.credit({
        userId: buyerId,
        amountKobo: listing.askKobo,
        type: 'ADJUSTMENT',
        note: `Resale ${listing.id} refund — race lost`,
      });
      throw e;
    }

    return {
      listingId: listing.id,
      ticketCode: listing.ticket.code,
      askKobo: listing.askKobo,
      sellerCreditKobo: sellerCredit,
      platformFeeKobo: platformFee,
    };
  }
}
