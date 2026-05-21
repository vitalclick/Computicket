import request from 'supertest';
import { createTestApp, seedMinimal, TestContext } from './helpers';

describe('Email verification gate (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    process.env.REQUIRE_VERIFIED_EMAIL = '1';
    ctx = await createTestApp();
  });
  afterAll(async () => {
    delete process.env.REQUIRE_VERIFIED_EMAIL;
    await ctx.close();
  });
  beforeEach(async () => {
    await ctx.resetDb();
    await seedMinimal(ctx.prisma);
  });

  async function signupAndToken(email: string): Promise<string> {
    const { body } = await request(ctx.app.getHttpServer())
      .post('/v1/auth/signup')
      .send({ email, password: 'Password123!' })
      .expect(201);
    return body.token;
  }

  it('refuses organizer creation when email is unverified', async () => {
    const token = await signupAndToken('unverified@test.ng');
    const res = await request(ctx.app.getHttpServer())
      .post('/v1/organizers')
      .set('authorization', `Bearer ${token}`)
      .send({ name: 'My Co', slug: 'my-co' })
      .expect(403);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  it('allows organizer creation once email is verified', async () => {
    const token = await signupAndToken('verified@test.ng');
    await ctx.prisma.user.update({
      where: { email: 'verified@test.ng' },
      data: { emailVerifiedAt: new Date() },
    });
    await request(ctx.app.getHttpServer())
      .post('/v1/organizers')
      .set('authorization', `Bearer ${token}`)
      .send({ name: 'Verified Co', slug: 'verified-co' })
      .expect(201);
  });

  it('refuses wallet top-up when email is unverified', async () => {
    const token = await signupAndToken('walletbuyer@test.ng');
    const res = await request(ctx.app.getHttpServer())
      .post('/v1/me/wallet/top-ups')
      .set('authorization', `Bearer ${token}`)
      .send({ amountKobo: 50_000 })
      .expect(403);
    expect(res.body.message).toMatch(/verify your email/i);
  });
});
