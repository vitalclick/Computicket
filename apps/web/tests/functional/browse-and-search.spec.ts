import { expect, test } from '@playwright/test';

/**
 * Anonymous browse + search. Doesn't touch auth — purely the public
 * surface a first-time visitor sees.
 */

test.describe('Anonymous browse', () => {
  test('home → events list → event detail flow', async ({ page }) => {
    await page.goto('/');
    // The Events link is in the primary nav.
    await page.getByRole('link', { name: 'Events' }).first().click();
    await expect(page).toHaveURL(/\/events/);
    // The seeded Davido event is present.
    const davido = page.getByRole('link', { name: /Davido/i }).first();
    await expect(davido).toBeVisible();
    await davido.click();
    await expect(page).toHaveURL(/\/events\/davido-timeless-tour-lagos/);
    await expect(page.getByRole('heading', { level: 1, name: /Davido/i })).toBeVisible();
    // Ticket types render with the brand-coloured "Pay with Paystack"-ish CTA
    await expect(page.getByText(/Regular|VIP/i).first()).toBeVisible();
  });

  test('search filters the events list', async ({ page }) => {
    await page.goto('/events');
    const search = page.getByPlaceholder(/Search by event/i);
    await search.fill('comedy');
    // Debounce is 200ms; wait for the network request to settle.
    await page.waitForLoadState('networkidle');
    // The Comedy Festival seed event should be visible.
    await expect(page.getByRole('link', { name: /Comedy/i }).first()).toBeVisible();
    // And the Davido event should NOT be — search is filtering.
    await expect(page.getByRole('link', { name: /Davido/i })).toHaveCount(0);
  });

  test('typo-tolerant search still surfaces the right event', async ({ page }) => {
    await page.goto('/events');
    await page.getByPlaceholder(/Search by event/i).fill('davdo'); // missing "i"
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /Davido/i }).first()).toBeVisible();
  });
});
