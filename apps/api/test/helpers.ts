import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Tables to wipe before each test file. Ordered so foreign-key
// dependants come first; CASCADE covers anything missed.
const TRUNCATE_TABLES = [
  'AuditLog',
  'PasswordResetToken',
  'EmailVerificationToken',
  'OAuthAuthorizationCode',
  'OAuthAccessToken',
  'OAuthClient',
  'PricingRule',
  'FlightBooking',
  'HotelBooking',
  'CorporateMember',
  'CorporateAccount',
  'AgentProfile',
  'TicketListing',
  'Voucher',
  'VoucherBatch',
  'LoyaltyTransaction',
  'Flight',
  'Hotel',
  'Broadcast',
  'AffiliateLink',
  'Referral',
  'OrderAddOn',
  'AddOn',
  'Seat',
  'WebhookDelivery',
  'WalletTransaction',
  'WalletTopUp',
  'Refund',
  'PromoCode',
  'WebhookEndpoint',
  'ApiKey',
  'Ticket',
  'OrderItem',
  'Order',
  'BusRoute',
  'TicketType',
  'Event',
  'OrganizerMember',
  'Organizer',
  'User',
];

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  resetDb: () => Promise<void>;
  close: () => Promise<void>;
}

export async function createTestApp(): Promise<TestContext> {
  // setup-env.ts seeds all env vars before AppModule loads — duplicating
  // them here for tests that import helpers.ts directly.
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt';
  process.env.APP_KEY = process.env.APP_KEY ?? 'test_app_key';

  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = mod.createNestApplication({ rawBody: true });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.init();
  const prisma = app.get(PrismaService);
  const resetDb = async () => {
    const list = TRUNCATE_TABLES.map((t) => `"${t}"`).join(', ');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  };
  await resetDb();
  return {
    app,
    prisma,
    resetDb,
    close: async () => {
      await app.close();
    },
  };
}

/**
 * Seed minimum domain data needed by tests: one approved organizer,
 * one published event with one ticket type, an admin user.
 */
export async function seedMinimal(prisma: PrismaService) {
  const pwHash = await bcrypt.hash('Password123!', 4);

  const owner = await prisma.user.create({
    data: { email: 'owner@test.ng', passwordHash: pwHash, name: 'Owner' },
  });
  const admin = await prisma.user.create({
    data: { email: 'admin@test.ng', passwordHash: pwHash, name: 'Admin', isAdmin: true },
  });
  const organizer = await prisma.organizer.create({
    data: {
      slug: 'test-org',
      name: 'Test Organizer',
      status: 'APPROVED',
      members: { create: { userId: owner.id, role: 'OWNER' } },
    },
  });
  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      slug: 'test-event',
      title: 'Test Event',
      venue: 'Test Venue',
      city: 'Lagos',
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      type: 'EVENT',
      ticketTypes: {
        create: [
          { name: 'Regular', priceKobo: 10_000_00, capacity: 100, position: 1 },
        ],
      },
    },
    include: { ticketTypes: true },
  });
  return { owner, admin, organizer, event };
}

/**
 * Paystack webhook signature (HMAC-SHA512 of the JSON body using the
 * secret key). Mirrors what the live webhook verification expects.
 */
export function paystackSig(body: string, secret = process.env.PAYSTACK_SECRET_KEY!): string {
  return createHmac('sha512', secret).update(body).digest('hex');
}
