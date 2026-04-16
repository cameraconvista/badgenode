import { defineConfig, devices } from '@playwright/test';

const appPort = process.env.PLAYWRIGHT_PORT || process.env.PORT || '5001';
const appUrl = `http://localhost:${appPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `PORT=${appPort} npm run dev`,
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
