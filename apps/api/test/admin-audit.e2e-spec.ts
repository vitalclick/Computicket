import request from 'supertest';
import { createTestApp, seedMinimal, TestContext } from './helpers';

describe('Admin actions + audit log (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => { ctx = await createTestApp(); });
  afterAll(async () => { await ctx.close(); });

  beforeEach(async () => {
    await ctx.resetDb();
  });

  async function adminToken(): Promise<string> {
    await seedMinimal(ctx.prisma);
    const { body } = await request(ctx.app.getHttpServer())
      .post('/v1/auth/signin')
      .send({ email: 'admin@test.ng', password: 'Password123!' })
      .expect(201);
    return body.token;
  }

  it('non-admin tokens cannot read the audit log', async () => {
    await seedMinimal(ctx.prisma);
    const { body: signup } = await request(ctx.app.getHttpServer())
      .post('/v1/auth/signup')
      .send({ email: 'plain@test.ng', password: 'Password123!' })
      .expect(201);
    await request(ctx.app.getHttpServer())
      .get('/v1/admin/audit-log')
      .set('authorization', `Bearer ${signup.token}`)
      .expect(403);
  });

  it('approve writes admin.organizer.approved with the actor on the audit row', async () => {
    const token = await adminToken();
    // Park the organizer back to PENDING so approve has work to do.
    await ctx.prisma.organizer.update({
      where: { slug: 'test-org' },
      data: { status: 'PENDING' },
    });
    await request(ctx.app.getHttpServer())
      .post('/v1/admin/organizers/test-org/approve')
      .set('authorization', `Bearer ${token}`)
      .expect(201);

    const log = await ctx.prisma.auditLog.findFirst({
      where: { action: 'admin.organizer.approved' },
    });
    expect(log).not.toBeNull();
    expect(log!.actorEmail).toBe('admin@test.ng');
    expect(log!.targetType).toBe('organizer');
    expect(log!.targetId).toBe('test-org');
  });

  it('suspend + commission changes each write an audit row', async () => {
    const token = await adminToken();
    await request(ctx.app.getHttpServer())
      .post('/v1/admin/organizers/test-org/suspend')
      .set('authorization', `Bearer ${token}`)
      .expect(201);
    await request(ctx.app.getHttpServer())
      .patch('/v1/admin/organizers/test-org/commission')
      .set('authorization', `Bearer ${token}`)
      .send({ bps: 600 })
      .expect(200);

    const actions = await ctx.prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } });
    const names = actions.map((a) => a.action);
    expect(names).toContain('admin.organizer.suspended');
    expect(names).toContain('admin.organizer.commission_changed');
    const commissionRow = actions.find((a) => a.action === 'admin.organizer.commission_changed')!;
    expect(commissionRow.metadata).toMatchObject({ bps: 600 });
  });
});
