import request from 'supertest';
import { authenticator } from 'otplib';
import { createTestApp, seedMinimal, TestContext } from './helpers';

describe('Auth & security (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => { ctx = await createTestApp(); });
  afterAll(async () => { await ctx.close(); });
  beforeEach(async () => {
    await ctx.resetDb();
    await seedMinimal(ctx.prisma);
  });

  describe('signup / signin', () => {
    it('signs up and returns a JWT', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!' })
        .expect(201);
      expect(res.body.token).toMatch(/^eyJ/);
      expect(res.body.user.email).toBe('buyer@test.ng');
    });

    it('rejects signin with the wrong password', async () => {
      await request(ctx.app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!' });
      await request(ctx.app.getHttpServer())
        .post('/v1/auth/signin')
        .send({ email: 'buyer@test.ng', password: 'wrong' })
        .expect(401);
    });

    it('locks the account after 5 wrong-password attempts', async () => {
      const server = ctx.app.getHttpServer();
      await request(server).post('/v1/auth/signup')
        .send({ email: 'lockme@test.ng', password: 'CorrectPassword1!' }).expect(201);
      for (let i = 0; i < 5; i++) {
        await request(server).post('/v1/auth/signin')
          .send({ email: 'lockme@test.ng', password: 'wrong' }).expect(401);
      }
      // 6th attempt — even with the right password — should be locked out.
      const res = await request(server).post('/v1/auth/signin')
        .send({ email: 'lockme@test.ng', password: 'CorrectPassword1!' })
        .expect(401);
      expect(res.body.message).toMatch(/locked|too many failed/i);

      // Lift the lock and confirm the success path clears the counter.
      await ctx.prisma.user.update({
        where: { email: 'lockme@test.ng' },
        data: { lockedUntil: null, failedSigninCount: 0 },
      });
      await request(server).post('/v1/auth/signin')
        .send({ email: 'lockme@test.ng', password: 'CorrectPassword1!' })
        .expect(201);
      const after = await ctx.prisma.user.findUniqueOrThrow({
        where: { email: 'lockme@test.ng' },
      });
      expect(after.failedSigninCount).toBe(0);
      expect(after.lockedUntil).toBeNull();
    });

    it('refuses duplicate signups', async () => {
      await request(ctx.app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!' })
        .expect(201);
      await request(ctx.app.getHttpServer())
        .post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!' })
        .expect(409);
    });
  });

  describe('password reset', () => {
    it('round-trips token-based reset and rejects the old password', async () => {
      const server = ctx.app.getHttpServer();
      await request(server).post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'OldPassword1!' });
      await request(server).post('/v1/auth/password-reset/request')
        .send({ email: 'buyer@test.ng' }).expect(201);

      // Grab the raw token from the DB via tokenHash row count + a fresh hash
      // would be brittle — instead, intercept by querying the most recent
      // unused token and reuse the service's hash function indirectly: just
      // confirm one was created, then exercise the confirm path with a token
      // generated through a second request (since the API doesn't expose
      // the plain token, simulate via direct DB write).
      // Simpler approach: re-issue via the service by calling the request
      // endpoint, then read the token row, fake the same plain token by
      // writing a fresh tokenHash for a known plain token.
      const knownPlain = 'plain-test-token-' + Date.now();
      const { createHash } = await import('crypto');
      const tokenHash = createHash('sha256').update(knownPlain).digest('hex');
      const user = await ctx.prisma.user.findUniqueOrThrow({ where: { email: 'buyer@test.ng' } });
      await ctx.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await request(server).post('/v1/auth/password-reset/confirm')
        .send({ token: knownPlain, newPassword: 'NewPassword456!' })
        .expect(201);

      await request(server).post('/v1/auth/signin')
        .send({ email: 'buyer@test.ng', password: 'OldPassword1!' })
        .expect(401);
      await request(server).post('/v1/auth/signin')
        .send({ email: 'buyer@test.ng', password: 'NewPassword456!' })
        .expect(201);
    });

    it('refuses single-use token replay', async () => {
      const server = ctx.app.getHttpServer();
      await request(server).post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'OldPassword1!' });
      const plain = 'plain-' + Date.now();
      const { createHash } = await import('crypto');
      const tokenHash = createHash('sha256').update(plain).digest('hex');
      const user = await ctx.prisma.user.findUniqueOrThrow({ where: { email: 'buyer@test.ng' } });
      await ctx.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await request(server).post('/v1/auth/password-reset/confirm')
        .send({ token: plain, newPassword: 'NewPassword456!' }).expect(201);
      await request(server).post('/v1/auth/password-reset/confirm')
        .send({ token: plain, newPassword: 'AnotherPassword789!' }).expect(401);
    });

    it('always returns 200 for password-reset requests (no enumeration)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/v1/auth/password-reset/request')
        .send({ email: 'nobody@nowhere.test' })
        .expect(201);
    });
  });

  describe('2FA TOTP', () => {
    it('enrolls, requires challenge on signin, and accepts a real code', async () => {
      const server = ctx.app.getHttpServer();
      const { body: signup } = await request(server).post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!' }).expect(201);
      const token = signup.token;

      const { body: setup } = await request(server)
        .post('/v1/me/security/2fa/setup')
        .set('authorization', `Bearer ${token}`)
        .expect(201);
      expect(setup.secret).toMatch(/^[A-Z2-7]+$/);

      const enableCode = authenticator.generate(setup.secret);
      await request(server)
        .post('/v1/me/security/2fa/enable')
        .set('authorization', `Bearer ${token}`)
        .send({ code: enableCode })
        .expect(201);

      // Signin without code → challenge
      const { body: challenge } = await request(server)
        .post('/v1/auth/signin')
        .send({ email: 'buyer@test.ng', password: 'Password123!' })
        .expect(201);
      expect(challenge.requires2FA).toBe(true);
      expect(challenge.challengeToken).toMatch(/^eyJ/);

      // Submit a real TOTP code → session
      const signinCode = authenticator.generate(setup.secret);
      const { body: session } = await request(server)
        .post('/v1/auth/signin/2fa')
        .send({ challengeToken: challenge.challengeToken, totpCode: signinCode })
        .expect(201);
      expect(session.token).toMatch(/^eyJ/);

      // Wrong code → 401
      await request(server)
        .post('/v1/auth/signin/2fa')
        .send({ challengeToken: challenge.challengeToken, totpCode: '000000' })
        .expect(401);
    });
  });

  describe('NDPR', () => {
    it('exports user data and scrubs PII on account deletion', async () => {
      const server = ctx.app.getHttpServer();
      const { body: signup } = await request(server).post('/v1/auth/signup')
        .send({ email: 'buyer@test.ng', password: 'Password123!', name: 'Buyer One' })
        .expect(201);
      const token = signup.token;

      const { body: ex } = await request(server).get('/v1/me/data-export')
        .set('authorization', `Bearer ${token}`).expect(200);
      expect(ex.profile.email).toBe('buyer@test.ng');
      expect(ex.profile.name).toBe('Buyer One');

      await request(server).delete('/v1/me/account')
        .set('authorization', `Bearer ${token}`)
        .send({ password: 'wrong' }).expect(401);
      await request(server).delete('/v1/me/account')
        .set('authorization', `Bearer ${token}`)
        .send({ password: 'Password123!' }).expect(200);

      const row = await ctx.prisma.user.findFirstOrThrow({
        where: { id: signup.user.id },
      });
      expect(row.email).toMatch(/^deleted-/);
      expect(row.name).toBeNull();
      expect(row.deletedAt).not.toBeNull();
    });
  });
});
