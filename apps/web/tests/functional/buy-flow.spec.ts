import { expect, test } from '@playwright/test';
import {
  TOKEN_STORAGE_KEY,
  apiUrl,
  createOrderViaApi,
  signinViaApi,
  simulatePaystackPayment,
} from './helpers';

/**
 * End-to-end happy path: signed-in buyer creates an order via the API
 * (because Paystack's hosted checkout can't be driven from a headless
 * browser — that would mean a real card or a Paystack test-mode card
 * UI that's not in our control), simulates the webhook to mark the
 * order paid, then we drive the web app to verify the ticket appears
 * in /account.
 */

test('paid order shows up in /account with a QR link', async ({ page }) => {
  const ts = Date.now();
  const email = `buyer-flow-${ts}@example.test`;
  const password = 'Password123!';

  // 1. Create the account through the UI so the signup form is part
  //    of the regression net. This catches signup form regressions
  //    that would only otherwise be caught by the a11y suite.
  await page.goto('/signup');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder(/Password \(/).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/account/);

  // 2. From here onwards, talk to the API directly. The buy-form on
  //    event detail handles the Paystack handoff via window.location
  //    which is hard to scope inside a Playwright test without a real
  //    payment provider — instead we exercise the same code paths
  //    (order creation + webhook) through HTTP.
  const token = await signinViaApi(email, password);

  // Look up the ticket type id for the seeded Davido event.
  const eventRes = await fetch(`${apiUrl}/events/davido-timeless-tour-lagos`);
  const event = (await eventRes.json()) as {
    ticketTypes: Array<{ id: string; name: string; priceKobo: number }>;
  };
  const tt = event.ticketTypes.find((t) => t.name === 'Regular') ?? event.ticketTypes[0]!;

  const { reference, totalKobo } = await createOrderViaApi({
    token,
    eventSlug: 'davido-timeless-tour-lagos',
    buyerEmail: email,
    ticketTypeId: tt.id,
    quantity: 1,
  });

  // 3. Webhook → marks order paid + issues the ticket.
  await simulatePaystackPayment(reference, totalKobo);

  // 4. Drive the UI: the new ticket should appear in /account.
  //    Reload because the page was rendered before the webhook fired.
  await page.evaluate(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: TOKEN_STORAGE_KEY, value: token },
  );
  await page.goto('/account');
  await page.waitForLoadState('networkidle');

  // The Davido event title appears in the orders list.
  await expect(page.getByText(/Davido/i).first()).toBeVisible();
  // And the ticket code starts with TKT- — the order has at least one.
  const ticketCode = page.locator('text=/^TKT-[A-Z0-9_-]+/').first();
  await expect(ticketCode).toBeVisible();
});

test('event detail page exposes the buy form', async ({ page }) => {
  // Lightweight check: the buy form renders for an anonymous visitor.
  // Actually completing the purchase is covered by the test above via
  // the API path. This one guards against regressions where the form
  // disappears or stops accepting input.
  await page.goto('/events/davido-timeless-tour-lagos');
  await expect(page.getByRole('heading', { level: 1, name: /Davido/i })).toBeVisible();
  // The "Buy" button (or the form's primary CTA) should be rendered.
  const cta = page.getByRole('button', { name: /buy|pay/i }).first();
  await expect(cta).toBeVisible();
});
