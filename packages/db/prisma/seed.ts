import { PrismaClient, OrganizerStatus, EventStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const adminHash = await bcrypt.hash('AdminPass123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@computicket.ng' },
    update: { passwordHash: adminHash, isAdmin: true },
    create: {
      email: 'admin@computicket.ng',
      name: 'Platform Admin',
      passwordHash: adminHash,
      isAdmin: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@livenation.ng' },
    update: { passwordHash },
    create: {
      email: 'owner@livenation.ng',
      phone: '+2348012345678',
      name: 'Adaeze Okonkwo',
      passwordHash,
    },
  });

  const organizer = await prisma.organizer.upsert({
    where: { slug: 'livenation-ng' },
    update: { status: OrganizerStatus.APPROVED, approvedAt: new Date(), approvedById: admin.id },
    create: {
      slug: 'livenation-ng',
      name: 'LiveNation Nigeria',
      status: OrganizerStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: admin.id,
      description: 'Premium concerts across Lagos, Abuja, and Port Harcourt.',
      members: {
        create: { userId: owner.id, role: 'OWNER' },
      },
    },
  });

  await prisma.event.upsert({
    where: { slug: 'davido-timeless-tour-lagos' },
    update: {},
    create: {
      slug: 'davido-timeless-tour-lagos',
      organizerId: organizer.id,
      title: 'Davido — Timeless Tour Lagos',
      description: 'The Timeless Tour lands in Lagos for one unforgettable night.',
      venue: 'Eko Convention Centre',
      city: 'Lagos',
      startsAt: new Date('2026-08-15T19:00:00+01:00'),
      endsAt: new Date('2026-08-15T23:30:00+01:00'),
      status: EventStatus.PUBLISHED,
      ticketTypes: {
        create: [
          { name: 'Regular', priceKobo: 1500000, capacity: 2000, position: 1 },
          { name: 'VIP', priceKobo: 5000000, capacity: 500, position: 2 },
          { name: 'VVIP Table (5 pax)', priceKobo: 25000000, capacity: 40, position: 3 },
        ],
      },
    },
  });

  await prisma.event.upsert({
    where: { slug: 'lagos-comedy-festival' },
    update: {},
    create: {
      slug: 'lagos-comedy-festival',
      organizerId: organizer.id,
      title: 'Lagos Comedy Festival 2026',
      description: 'A weekend of the funniest acts on the continent.',
      venue: 'Landmark Event Centre',
      city: 'Lagos',
      startsAt: new Date('2026-09-20T18:00:00+01:00'),
      endsAt: new Date('2026-09-20T22:00:00+01:00'),
      status: EventStatus.PUBLISHED,
      ticketTypes: {
        create: [
          { name: 'Standard', priceKobo: 1000000, capacity: 1500, position: 1 },
          { name: 'Front Row', priceKobo: 3500000, capacity: 200, position: 2 },
        ],
      },
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
