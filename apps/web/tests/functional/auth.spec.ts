import { expect, test } from '@playwright/test';
import { TOKEN_STORAGE_KEY, apiUrl } from './helpers';

/**
 * Sign-up → see /account, sign-out, sign-in.
 *
 * We use a per-test fresh email derived from a timestamp so re-runs
 * don't trip the unique-email constraint. The API e2e jest suite
 * truncates the DB between specs; this one doesn't (it shares a DB
 * with the dev/CI postgres), so isolation is by uniqueness instead.
 *
 * Selectors prefer placeholder over label because the labels in
 * signin/signup are visually hidden (className="sr-only") and the
 * forgot-password page has no explicit label at all — the placeholder
 * is the user-visible affordance and is stable across all three.
 */

test.describe('Auth flow', () => {
  test('signup → land on account → sign out → sign in again', async ({ page }) => {
    const ts = Date.now();
    const email = `playwright-${ts}@example.test`;
    const password = 'Password123!';

    await page.goto('/signup');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder(/Password \(/).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    // Lands on /account — the heading is the most stable assertion.
    await page.waitForURL(/\/account/);
    await expect(page.getByRole('heading', { name: /your tickets/i })).toBeVisible();

    // Token was persisted to localStorage under the expected key.
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      TOKEN_STORAGE_KEY,
    );
    expect(stored).toMatch(/^eyJ/);

    // Sign out by clearing storage + revisiting /account (the nav
    // exposes Sign out elsewhere, but storage clear is the reliable
    // mechanism behind it).
    await page.evaluate((key) => window.localStorage.removeItem(key), TOKEN_STORAGE_KEY);
    await page.goto('/account');
    // Unauthed /account redirects to /signin with a next= param.
    await page.waitForURL(/\/signin/);

    // Sign in with the same credentials.
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/account/);
  });

  test('signin with wrong password surfaces an error', async ({ page }) => {
    await page.goto('/signin');
    await page.getByPlaceholder('Email').fill('admin@computicket.ng');
    await page.getByPlaceholder('Password').fill('definitely-wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // The error renders with role="alert"; we asserted that in the a11y
    // pass and check it again here for behaviour parity. Next ships a
    // hidden #__next-route-announcer__ that's also role=alert, so we
    // filter by visible text to avoid the strict-mode collision.
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /invalid|wrong/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });

  test('forgot-password form always reports "sent" (no enumeration)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('Email').fill('definitely-not-registered@example.test');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/reset link is on its way/i)).toBeVisible();
  });
});

// Sanity that the API the suite depends on is reachable. Catches the
// "you forgot to start the API" footgun before the real tests start
// reporting confusing failures.
test('API health probe is green', async () => {
  const res = await fetch(`${apiUrl}/health`);
  expect(res.status).toBe(200);
  const body = (await res.json()) as { status: string };
  expect(body.status).toBe('ok');
});
