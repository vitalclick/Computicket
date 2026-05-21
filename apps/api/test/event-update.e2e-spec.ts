import request from 'supertest';
import { createTestApp, seedMinimal, TestContext } from './helpers';

describe('PATCH /v1/events/:slug (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => { ctx = await createTestApp(); });
  afterAll(async () => { await ctx.close(); });
  beforeEach(async () => { await ctx.resetDb(); });

  async function ownerToken(): Promise<string> {
    await seedMinimal(ctx.prisma);
    const { body } = await request(ctx.app.getHttpServer())
      .post('/v1/auth/signin')
      .send({ email: 'owner@test.ng', password: 'Password123!' })
      .expect(201);
    return body.token;
  }

  it('updates allowed fields and rejects an inverted date range', async () => {
    const token = await ownerToken();
    const server = ctx.app.getHttpServer();

    const { body: updated } = await request(server)
      .patch('/v1/events/test-event')
      .set('authorization', `Bearer ${token}`)
      .send({ title: 'Test Event — Renamed', venue: 'New Venue' })
      .expect(200);
    expect(updated.title).toBe('Test Event — Renamed');
    expect(updated.venue).toBe('New Venue');

    await request(server)
      .patch('/v1/events/test-event')
      .set('authorization', `Bearer ${token}`)
      .send({
        startsAt: '2027-01-01T18:00:00Z',
        endsAt: '2027-01-01T17:00:00Z',
      })
      .expect(400);
  });

  it('refuses non-members', async () => {
    await seedMinimal(ctx.prisma);
    const { body: outsider } = await request(ctx.app.getHttpServer())
      .post('/v1/auth/signup')
      .send({ email: 'outsider@test.ng', password: 'Password123!' })
      .expect(201);
    await request(ctx.app.getHttpServer())
      .patch('/v1/events/test-event')
      .set('authorization', `Bearer ${outsider.token}`)
      .send({ title: 'Hijacked' })
      .expect(403);
  });
});
