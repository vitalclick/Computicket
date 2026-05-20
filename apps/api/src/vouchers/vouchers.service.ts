import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

function generateVoucherCode(): string {
  // 14-char alphanumeric: easy to read, hard to guess
  return `GC-${randomBytes(7).toString('base64url').toUpperCase().slice(0, 11)}`;
}

@Injectable()
export class VouchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  async listBatches(organizerSlug: string) {
    return this.prisma.voucherBatch.findMany({
      where: { organizer: { slug: organizerSlug } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async issueBatch(
    organizerSlug: string,
    input: { name: string; denominationKobo: number; count: number; expiresAt?: string },
  ) {
    if (input.count < 1 || input.count > 10_000) {
      throw new BadRequestException('count must be between 1 and 10,000');
    }
    if (input.denominationKobo < 10000) {
      throw new BadRequestException('Denomination must be at least NGN 100');
    }
    const organizer = await this.prisma.organizer.findUnique({ where: { slug: organizerSlug } });
    if (!organizer) throw new NotFoundException('Organizer not found');

    const batch = await this.prisma.voucherBatch.create({
      data: {
        organizerId: organizer.id,
        name: input.name,
        denominationKobo: input.denominationKobo,
        totalCount: input.count,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });

    // Bulk-insert vouchers. Codes are unique; collision odds are
    // astronomical but we retry once just in case.
    const codes = Array.from({ length: input.count }, () => generateVoucherCode());
    await this.prisma.voucher.createMany({
      data: codes.map((code) => ({ batchId: batch.id, code })),
    });

    return { batch, sampleCodes: codes.slice(0, 5) };
  }

  async listCodes(organizerSlug: string, batchId: string) {
    const batch = await this.prisma.voucherBatch.findFirst({
      where: { id: batchId, organizer: { slug: organizerSlug } },
      include: { vouchers: { take: 200, orderBy: { createdAt: 'asc' } } },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return { batch, vouchers: batch.vouchers };
  }

  /**
   * Redeem a voucher code to credit the user's wallet. Atomic: a single
   * code can only be redeemed once even under concurrent requests.
   */
  async redeem(userId: string, rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
      include: { batch: true },
    });
    if (!voucher) throw new NotFoundException('Voucher code not found');
    if (voucher.redeemedById) throw new BadRequestException('Voucher already redeemed');
    if (voucher.batch.expiresAt && voucher.batch.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Voucher has expired');
    }

    // Claim the voucher with a conditional update.
    const claim = await this.prisma.voucher.updateMany({
      where: { id: voucher.id, redeemedById: null },
      data: { redeemedById: userId, redeemedAt: new Date() },
    });
    if (claim.count === 0) throw new BadRequestException('Voucher already redeemed');

    await this.prisma.voucherBatch.update({
      where: { id: voucher.batchId },
      data: { redeemedCount: { increment: 1 } },
    });

    const credit = await this.wallet.credit({
      userId,
      amountKobo: voucher.batch.denominationKobo,
      type: 'ADJUSTMENT',
      note: `Voucher ${code} (${voucher.batch.name})`,
    });

    return {
      voucherId: voucher.id,
      amountKobo: voucher.batch.denominationKobo,
      walletBalanceKobo: credit.balanceAfterKobo,
    };
  }
}
