import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

// Same key the web app reads in apps/web/src/lib/auth.ts. If you change
// the storage key there, change it here too — there's no shared
// constant because the web bundle and the test runner don't share an
// import graph.
const TOKEN_STORAGE_KEY = 'ctng_token';

/**
 * Hits POST /v1/auth/signin directly so the fixture doesn't depend on
 * the signin UI being a11y-clean (which is what we're trying to test
 * elsewhere). Returns the JWT.
 */
async function signinViaApi(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(
      `Signin failed for ${email}: HTTP ${res.status} ${await res.text()}`,
    );
  }
  const body = (await res.json()) as { token?: string; requires2FA?: boolean };
  if (!body.token) {
    throw new Error(
      `Signin for ${email} didn't return a token (requires2FA=${body.requires2FA}); ` +
        `the a11y fixture only supports accounts without 2FA enabled.`,
    );
  }
  return body.token;
}

async function authedPage(
  context: import('@playwright/test').BrowserContext,
  email: string,
  password: string,
): Promise<Page> {
  const token = await signinViaApi(email, password);
  const page = await context.newPage();
  // Inject before any client JS runs so /account/* doesn't bounce us
  // to /signin on first paint.
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: TOKEN_STORAGE_KEY, value: token },
  );
  return page;
}

interface AuthedFixtures {
  buyerPage: Page;
  managerPage: Page;
  adminPage: Page;
}

export const test = base.extend<AuthedFixtures>({
  buyerPage: async ({ context }, use) => {
    const page = await authedPage(context, 'buyer@example.com', 'Password123!');
    await use(page);
    await page.close();
  },
  managerPage: async ({ context }, use) => {
    const page = await authedPage(context, 'manager@livenation.ng', 'Password123!');
    await use(page);
    await page.close();
  },
  adminPage: async ({ context }, use) => {
    const page = await authedPage(context, 'admin@computicket.ng', 'AdminPass123!');
    await use(page);
    await page.close();
  },
});

export { expect };

/**
 * Shared axe-core invocation. Fails on serious + critical only;
 * moderate/minor are logged to stdout for triage but don't gate.
 */
export async function scan(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blockers = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

  // eslint-disable-next-line no-console
  console.log(
    `[a11y:${label}] ${results.violations.length} total, ${blockers.length} blocking`,
  );
  if (results.violations.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.helpUrl,
      })),
    );
  }

  expect(
    blockers,
    `Serious or critical a11y violations on "${label}":\n${JSON.stringify(blockers, null, 2)}`,
  ).toEqual([]);
}
