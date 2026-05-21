import request from 'supertest';
import { createTestApp, seedMinimal, TestContext } from './helpers';

describe('External adapters dev fallback (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => { ctx = await createTestApp(); });
  afterAll(async () => { await ctx.close(); });
  beforeEach(async () => {
    await ctx.resetDb();
    await seedMinimal(ctx.prisma);
  });

  it('flights search returns only local results when DUFFEL_API_KEY is unset', async () => {
    // Seed a local flight for the test organizer
    const organizer = await ctx.prisma.organizer.findUniqueOrThrow({ where: { slug: 'test-org' } });
    await ctx.prisma.flight.create({
      data: {
        organizerId: organizer.id,
        flightNumber: 'WT100',
        airline: 'Air Test',
        fromAirport: 'LOS',
        toAirport: 'ABV',
        departsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        arrivesAt: new Date(Date.now() + 26 * 60 * 60 * 1000),
        priceKobo: 50_000_00,
        capacity: 100,
        active: true,
      },
    });
    const { body } = await request(ctx.app.getHttpServer())
      .get('/v1/flights?from=LOS&to=ABV')
      .expect(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.every((r: { source: string }) => r.source === 'local')).toBe(true);
    expect(body.some((r: { flightNumber: string }) => r.flightNumber === 'WT100')).toBe(true);
  });

  it('hotels search returns only local results when HotelBeds keys are unset', async () => {
    const organizer = await ctx.prisma.organizer.findUniqueOrThrow({ where: { slug: 'test-org' } });
    await ctx.prisma.hotel.create({
      data: {
        organizerId: organizer.id,
        slug: 'test-hotel',
        name: 'Test Hotel',
        city: 'Lagos',
        address: '1 Test Road',
        pricePerNightKobo: 30_000_00,
        capacity: 10,
        active: true,
      },
    });
    const { body } = await request(ctx.app.getHttpServer())
      .get('/v1/hotels?city=Lagos')
      .expect(200);
    expect(body.every((r: { source: string }) => r.source === 'local')).toBe(true);
    expect(body.some((r: { name: string }) => r.name === 'Test Hotel')).toBe(true);
  });
});
