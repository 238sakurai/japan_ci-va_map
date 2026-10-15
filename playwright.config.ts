import { defineConfig, devices } from '@playwright/test'

/** vite.config.ts と同じ既定値。CI では BASE_PATH で上書きできる */
const basePath = process.env.BASE_PATH ?? '/japan_ci-va_map/'
const baseURL = `http://127.0.0.1:4173${basePath}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
