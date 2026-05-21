import { test } from '@playwright/test';
import { scan } from './fixtures';

/**
 * Smoke a11y suite for public + auth pages — no session required.
 * The authed surface lives in authed.spec.ts so this file stays
 * runnable even if the API seed hasn't planted the fixture users.
 *
 * `scan()` enforces WCAG 2.0 + 2.1 A + AA, failing only on serious
 * and critical impacts. See ./fixtures.ts for the shared helper.
 */

test.describe('Public surface', () => {
  test('home', async ({ page }) => {
    await page.goto('/');
    // Wait for the SSR'd hero copy so axe runs against the real
    // initial paint, not the loading skeleton.
    await page.waitForLoadState('networkidle');
    await scan(page, 'home');
  });

  test('events list', async ({ page }) => {
    await page.goto('/events');
    await page.waitForSelector('input[type="search"]');
    await scan(page, 'events');
  });

  test('event detail', async ({ page }) => {
    // The seed plants `davido-timeless-tour-lagos`; the API e2e suite
    // re-seeds before this job runs so it's reliably present.
    await page.goto('/events/davido-timeless-tour-lagos');
    await page.waitForSelector('h1');
    await scan(page, 'event detail');
  });

  test('for organizers', async ({ page }) => {
    await page.goto('/for-organizers');
    await page.waitForLoadState('networkidle');
    await scan(page, 'for organizers');
  });
});

test.describe('Auth pages', () => {
  test('signin', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForSelector('input[type="email"]');
    await scan(page, 'signin');
  });

  test('signup', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForSelector('input[type="email"]');
    await scan(page, 'signup');
  });

  test('forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForSelector('input[type="email"]');
    await scan(page, 'forgot password');
  });
});
