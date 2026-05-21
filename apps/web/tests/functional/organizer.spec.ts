import { expect, test } from '@playwright/test';
import { TOKEN_STORAGE_KEY, signinViaApi } from './helpers';

/**
 * Organizer manager visits the dashboard. The seed plants
 * manager@livenation.ng (Password123!) as a MANAGER on the
 * livenation-ng org — same fixture used by the a11y suite.
 */

test('manager dashboard lists organizer events with status', async ({ page }) => {
  const token = await signinViaApi('manager@livenation.ng', 'Password123!');
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: TOKEN_STORAGE_KEY, value: token },
  );
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/LiveNation/i).first()).toBeVisible();

  // Drill into the organizer.
  await page.goto('/dashboard/o/livenation-ng');
  await page.waitForLoadState('networkidle');
  // The Davido event card lives here.
  await expect(page.getByText(/Davido/i).first()).toBeVisible();
});

test('admin can view the audit log', async ({ page }) => {
  const token = await signinViaApi('admin@computicket.ng', 'AdminPass123!');
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: TOKEN_STORAGE_KEY, value: token },
  );
  await page.goto('/admin/audit-log');
  await page.waitForLoadState('networkidle');
  // The action-filter input is the most stable selector — Filter
  // button next to it could match other surfaces.
  await expect(page.getByPlaceholder(/Filter by action/i)).toBeVisible();
});
