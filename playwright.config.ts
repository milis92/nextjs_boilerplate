import { defineConfig, devices } from "@playwright/test"
import * as dotenv from "@dotenvx/dotenvx"

// .env.test.local is an optional gitignored overlay for secrets — first file wins.
const ENV = dotenv.config({
  path: [".env.test.local", ".env.test"],
  ignore: ["MISSING_ENV_FILE"],
  quiet: true,
}).parsed
if (!ENV?.NEXT_PUBLIC_APP_URL) {
  throw new Error(
    ".env.test is missing or incomplete (NEXT_PUBLIC_APP_URL is required). It is committed to the repo — restore it from git."
  )
}
const APP_URL = ENV.NEXT_PUBLIC_APP_URL

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  // Look for files with the .spec.js or .e2e.js extension
  testMatch: "*.@(spec|e2e).?(c|m)[jt]s?(x)",
  // Timeout per test
  timeout: 30 * 1000,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI ? "github" : "list",

  expect: {
    // Set timeout for async expect matchers
    timeout: 15 * 1000,
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: APP_URL,
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: "SIGTERM", timeout: 2 * 1000 },
  },

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL: APP_URL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: process.env.CI ? "on" : "retain-on-failure",

    // Record videos when retrying the failed test.
    video: process.env.CI ? "retain-on-failure" : undefined,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(process.env.CI
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
        ]
      : []),
  ],
})
