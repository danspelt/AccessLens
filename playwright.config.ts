import { defineConfig, devices } from '@playwright/test';

// Keep the test server separate from a developer's usual local app port. That
// avoids silently running smoke tests against an unrelated service on :3000.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run build && node --env-file=.env.local .next/standalone/server.js',
        env: { PORT: '3100' },
        url: baseURL,
        reuseExistingServer: false,
        timeout: 300_000,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
