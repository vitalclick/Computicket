import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke a11y suite. Visits each public + auth page, runs axe-core
 * against it, and fails the build only on `serious` or `critical`
 * violations. `moderate` and `minor` are surfaced in the report (and
 * stored as an HTML artifact in CI) but don't gate the merge — they
 * tend to flag legitimate design choices (e.g. low-contrast helper
 * text) that we want to triage rather than auto-fail on.
 *
 * Rule tags: WCAG 2.0 + 2.1, levels A + AA. This is the baseline most
 * organisations require for "we comply with WCAG"; AAA is the
 * stretch goal and we'd surface it as a separate, non-blocking job.
 */

async function scan(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blockers = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

  // Print a compact summary on every run so the HTML report and the
  // log line both tell the same story.
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.length,
    help: v.helpUrl,
  }));
  // eslint-disable-next-line no-console
  console.log(`[a11y:${label}] ${results.violations.length} total, ${blockers.length} blocking`);
  // eslint-disable-next-line no-console
  if (results.violations.length > 0) console.log(summary);

  expect(
    blockers,
    `Serious or critical a11y violations on "${label}":\n${JSON.stringify(blockers, null, 2)}`,
  ).toEqual([]);
}

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
