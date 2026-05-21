import { test, scan } from './fixtures';

/**
 * Authed-surface a11y scans. Each fixture signs the role in via the
 * API and seeds the JWT into localStorage before the page navigates,
 * so the first paint is the real authed view (not the /signin
 * redirect).
 *
 * Seeded fixtures (`pnpm db:seed`):
 *   buyer@example.com       Password123!         plain buyer
 *   manager@livenation.ng   Password123!         OrganizerMember(MANAGER)
 *   admin@computicket.ng    AdminPass123!        platform admin
 */

test.describe('Buyer surface', () => {
  test('account home', async ({ buyerPage }) => {
    await buyerPage.goto('/account');
    await buyerPage.waitForLoadState('networkidle');
    await scan(buyerPage, 'account');
  });

  test('account security (2FA + sessions + NDPR)', async ({ buyerPage }) => {
    await buyerPage.goto('/account/security');
    // The page loads asynchronously after the token check; wait for the
    // first section heading so axe scans the populated DOM.
    await buyerPage.waitForSelector('h1');
    await buyerPage.waitForLoadState('networkidle');
    await scan(buyerPage, 'account security');
  });

  test('wallet', async ({ buyerPage }) => {
    await buyerPage.goto('/account/wallet');
    await buyerPage.waitForLoadState('networkidle');
    await scan(buyerPage, 'wallet');
  });

  test('support chat', async ({ buyerPage }) => {
    await buyerPage.goto('/support');
    await buyerPage.waitForSelector('textarea');
    await scan(buyerPage, 'support');
  });
});

test.describe('Organizer manager surface', () => {
  test('dashboard home', async ({ managerPage }) => {
    await managerPage.goto('/dashboard');
    await managerPage.waitForLoadState('networkidle');
    await scan(managerPage, 'dashboard');
  });

  test('dashboard organizer detail', async ({ managerPage }) => {
    await managerPage.goto('/dashboard/o/livenation-ng');
    await managerPage.waitForSelector('h1');
    await managerPage.waitForLoadState('networkidle');
    await scan(managerPage, 'dashboard organizer detail');
  });
});

test.describe('Platform admin surface', () => {
  test('admin home', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('networkidle');
    await scan(adminPage, 'admin');
  });

  test('audit log', async ({ adminPage }) => {
    await adminPage.goto('/admin/audit-log');
    await adminPage.waitForLoadState('networkidle');
    await scan(adminPage, 'audit log');
  });
});
