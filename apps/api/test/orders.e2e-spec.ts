import request from 'supertest';
import { createTestApp, paystackSig, seedMinimal, TestContext } from './helpers';

describe('Orders, webhook, refunds (e2e)', () => {
  let ctx: TestContext;
  beforeAll(async () => { ctx = await createTestApp(); });
  afterAll(async () => { await ctx.close(); });
  beforeEach(async () => {
    await ctx.resetDb();
  });

  async function buyOneTicket() {
    const seed = await seedMinimal(ctx.prisma);
    const server = ctx.app.getHttpServer();
    const ttId = seed.event.ticketTypes[0]!.id;
    const { body: order } = await request(server)
      .post('/v1/orders')
      .send({
        eventSlug: 'test-event',
        buyerEmail: 'buyer@test.ng',
        items: [{ ticketTypeId: ttId, quantity: 1 }],
      })
      .expect(201);
    return { ...seed, order };
  }

  it('creates an order with PENDING status and Paystack reference', async () => {
    const { order } = await buyOneTicket();
    expect(order.order.paystackRef).toMatch(/^[a-z0-9_-]+$/i);
    expect(order.paystack.reference).toBe(order.order.paystackRef);
    const dbOrder = await ctx.prisma.order.findUniqueOrThrow({ where: { id: order.order.id } });
    expect(dbOrder.status).toBe('PENDING');
  });

  it('webhook with correct signature marks order PAID and issues tickets', async () => {
    const { order } = await buyOneTicket();
    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: order.order.paystackRef, amount: order.order.totalKobo, status: 'success' },
    });
    await request(ctx.app.getHttpServer())
      .post('/v1/webhooks/paystack')
      .set('x-paystack-signature', paystackSig(payload))
      .set('content-type', 'application/json')
      .send(payload)
      .expect(200);

    const dbOrder = await ctx.prisma.order.findUniqueOrThrow({
      where: { id: order.order.id },
      include: { tickets: true },
    });
    expect(dbOrder.status).toBe('PAID');
    expect(dbOrder.tickets).toHaveLength(1);
    expect(dbOrder.tickets[0]!.status).toBe('ISSUED');
    expect(dbOrder.tickets[0]!.code).toMatch(/^TKT-/);
  });

  it('webhook with bad signature is rejected and order stays PENDING', async () => {
    const { order } = await buyOneTicket();
    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: order.order.paystackRef, amount: order.order.totalKobo, status: 'success' },
    });
    await request(ctx.app.getHttpServer())
      .post('/v1/webhooks/paystack')
      .set('x-paystack-signature', 'not-a-real-signature')
      .set('content-type', 'application/json')
      .send(payload)
      .expect(401);

    const dbOrder = await ctx.prisma.order.findUniqueOrThrow({ where: { id: order.order.id } });
    expect(dbOrder.status).toBe('PENDING');
  });

  it('webhook replay is idempotent — tickets are issued exactly once', async () => {
    const { order } = await buyOneTicket();
    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: order.order.paystackRef, amount: order.order.totalKobo, status: 'success' },
    });
    const sig = paystackSig(payload);
    const server = ctx.app.getHttpServer();
    await request(server).post('/v1/webhooks/paystack')
      .set('x-paystack-signature', sig).set('content-type', 'application/json')
      .send(payload).expect(200);
    await request(server).post('/v1/webhooks/paystack')
      .set('x-paystack-signature', sig).set('content-type', 'application/json')
      .send(payload).expect(200);

    const tickets = await ctx.prisma.ticket.count({ where: { orderId: order.order.id } });
    expect(tickets).toBe(1);
  });

  it('full refund voids tickets and is idempotent', async () => {
    const { order, owner } = await buyOneTicket();
    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: order.order.paystackRef, amount: order.order.totalKobo, status: 'success' },
    });
    const server = ctx.app.getHttpServer();
    await request(server).post('/v1/webhooks/paystack')
      .set('x-paystack-signature', paystackSig(payload))
      .set('content-type', 'application/json')
      .send(payload).expect(200);

    const { body: ownerSession } = await request(server)
      .post('/v1/auth/signin')
      .send({ email: owner.email, password: 'Password123!' })
      .expect(201);
    const ownerTok = ownerSession.token;

    const { body: r1 } = await request(server)
      .post(`/v1/dashboard/orders/${order.order.id}/refund`)
      .set('authorization', `Bearer ${ownerTok}`)
      .send({})
      .expect(201);
    expect(r1.status).toBe('REFUNDED');
    expect(r1.alreadyRefunded).toBe(false);

    const dbOrder = await ctx.prisma.order.findUniqueOrThrow({
      where: { id: order.order.id },
      include: { tickets: true },
    });
    expect(dbOrder.status).toBe('REFUNDED');
    expect(dbOrder.tickets.every((t) => t.status === 'VOIDED')).toBe(true);

    // Replay → alreadyRefunded
    const { body: r2 } = await request(server)
      .post(`/v1/dashboard/orders/${order.order.id}/refund`)
      .set('authorization', `Bearer ${ownerTok}`)
      .send({})
      .expect(201);
    expect(r2.alreadyRefunded).toBe(true);
  });
});
