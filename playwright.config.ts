import { defineConfig } from '@playwright/test';
import { getBankGwBaseUrl, getEnvironment } from './src/core/config/environment';

const env = getEnvironment();
const isCi = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-report.xml' }],
  ],
  use: {
    baseURL: getBankGwBaseUrl(),
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: getBankGwBaseUrl(),
      },
    },
  ],
  outputDir: 'test-results',
  metadata: {
    env: env.ENV,
    pgw: env.CORE_PGW_URL,
  },
});
