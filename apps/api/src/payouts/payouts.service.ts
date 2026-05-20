import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';

// Subset of Nigerian banks supported at launch. Codes per Paystack.
// Full list available from GET /bank?country=nigeria once we wire it.
export const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'SunTrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

@Injectable()
export class PayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
  ) {}

  listBanks() {
    return { banks: NIGERIAN_BANKS };
  }

  async get(organizerSlug: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug: organizerSlug },
      select: {
        slug: true,
        name: true,
        commissionBps: true,
        paystackSubaccountCode: true,
        payoutBankCode: true,
        payoutAccountNumber: true,
        payoutAccountName: true,
      },
    });
    if (!organizer) throw new NotFoundException(`Organizer "${organizerSlug}" not found`);
    return {
      ...organizer,
      bankName: NIGERIAN_BANKS.find((b) => b.code === organizer.payoutBankCode)?.name ?? null,
      commissionPercent: organizer.commissionBps / 100,
      isSetUp: Boolean(organizer.paystackSubaccountCode),
    };
  }

  async setBankDetails(
    organizerSlug: string,
    input: { bankCode: string; accountNumber: string },
  ) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { slug: organizerSlug },
    });
    if (!organizer) throw new NotFoundException(`Organizer "${organizerSlug}" not found`);

    const result = await this.paystack.createSubaccount({
      businessName: organizer.name,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      percentageCharge: organizer.commissionBps / 100,
    });

    const updated = await this.prisma.organizer.update({
      where: { id: organizer.id },
      data: {
        paystackSubaccountCode: result.subaccountCode,
        payoutBankCode: input.bankCode,
        payoutAccountNumber: input.accountNumber,
        payoutAccountName: result.accountName,
      },
    });

    return {
      subaccountCode: updated.paystackSubaccountCode,
      bankCode: updated.payoutBankCode,
      accountNumber: updated.payoutAccountNumber,
      accountName: updated.payoutAccountName,
      bankName: NIGERIAN_BANKS.find((b) => b.code === input.bankCode)?.name ?? null,
    };
  }
}
