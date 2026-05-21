import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright spins up `next start` and runs axe-core scans against the
 * public + auth pages. The API is expected to be running separately —
 * locally that means `pnpm --filter @computicket/api run dev`; in CI
 * the workflow boots the prod build in the background before invoking
 * `pnpm test:a11y`.
 *
 * Each spec is scoped to one route family so failures point at the
 * smallest possible surface.
 */
const PORT = Number(process.env.WEB_PORT ?? 3100);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
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
