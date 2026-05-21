import { defineConfig, devices } from '@playwright/test';

/**
 * Happy-path functional suite — distinct from playwright.config.ts
 * which is the a11y axe-core sweep. Different testDir so the two
 * suites can be run separately in CI without one's failures hiding
 * the other.
 *
 * Same `next start` webServer pattern; the API is brought up
 * externally (locally by the dev, in CI by the workflow before this
 * invocation).
 */
const PORT = Number(process.env.WEB_PORT ?? 3100);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export default defineConfig({
  testDir: './tests/functional',
  // Functional tests touch DB rows (signup, order create) so running
  // them in parallel risks interference. Single-worker keeps things
  // boringly deterministic.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-functional-report' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Honour an externally-supplied browser executable so sandboxes
        // that can't fetch the Playwright-bundled Chromium can still
        // run the suite. Unset = use the bundled one.
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? {
              launchOptions: {
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
                args: ['--no-sandbox'],
              },
            }
          : {}),
      },
    },
  ],
  webServer: {
    // Invoke next directly so the port flag reaches it (the
    // pnpm-run wrapper would eat `-p 3100` as a pnpm option).
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    timeout: 90_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: API_URL,
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${PORT}`,
    },
  },
});
