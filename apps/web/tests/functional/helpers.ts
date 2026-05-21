import { createHmac } from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? 'sk_test_replace_me';

export const apiUrl = API_URL;

/**
 * The same auth helper the a11y fixture uses — sign in via the API
 * directly so the test isn't gated on the signin UI being clean. The
 * caller injects the returned JWT into localStorage via
 * page.addInitScript before navigating to any authed route.
 */
export async function signinViaApi(
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Signin failed for ${email}: ${res.status}`);
  const body = (await res.json()) as { token?: string };
  if (!body.token) throw new Error(`Signin for ${email} returned no token`);
  return body.token;
}

/**
 * Simulates a Paystack webhook so the rest of the post-payment flow
 * (ticket issuance, email, push, audit) fires. Uses the same secret
 * the API verifies with — in CI that's `sk_test_replace_me` from
 * the workflow env.
 */
export async function simulatePaystackPayment(
  reference: string,
  amountKobo: number,
): Promise<void> {
  const payload = JSON.stringify({
    event: 'charge.success',
    data: { reference, amount: amountKobo, status: 'success' },
  });
  const sig = createHmac('sha512', PAYSTACK_SECRET).update(payload).digest('hex');
  const res = await fetch(`${API_URL}/webhooks/paystack`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-paystack-signature': sig,
    },
    body: payload,
  });
  if (!res.ok) {
    throw new Error(`Webhook simulation failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Create an order via the API so the buy-form UI doesn't have to be
 * scripted end-to-end. Returns the Paystack reference + the total so
 * the caller can simulate the matching webhook.
 */
export async function createOrderViaApi(input: {
  token: string;
  eventSlug: string;
  buyerEmail: string;
  ticketTypeId: string;
  quantity: number;
}): Promise<{ orderId: string; reference: string; totalKobo: number }> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      eventSlug: input.eventSlug,
      buyerEmail: input.buyerEmail,
      items: [{ ticketTypeId: input.ticketTypeId, quantity: input.quantity }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Order creation failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as {
    order: { id: string; paystackRef: string; totalKobo: number };
  };
  return {
    orderId: body.order.id,
    reference: body.order.paystackRef,
    totalKobo: body.order.totalKobo,
  };
}

/**
 * Same localStorage key the web app reads in apps/web/src/lib/auth.ts.
 */
export const TOKEN_STORAGE_KEY = 'ctng_token';
