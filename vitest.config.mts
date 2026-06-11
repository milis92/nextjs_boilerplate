import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig, ViteUserConfig } from "vitest/config"
import * as dotenv from "@dotenvx/dotenvx"

export default defineConfig((): ViteUserConfig => {
  // .env.test.local is an optional gitignored overlay for secrets — first file wins.
  const env = dotenv.config({
    path: [".env.test.local", ".env.test"],
    ignore: ["MISSING_ENV_FILE"],
    quiet: true,
  })
  if (!env.parsed?.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      ".env.test is missing or incomplete (NEXT_PUBLIC_APP_URL is required). It is committed to the repo — restore it from git."
    )
  }
  return {
    plugins: [react()],
    resolve: {
      // Mirror the `@/*` path alias from tsconfig.json.
      alias: { "@": new URL("./src", import.meta.url).pathname },
    },
    test: {
      env: env.parsed,
      coverage: {
        include: ["src/app/**/*", "src/components/**/*", "src/lib/**/*"],
        exclude: ["**/*.stories.{js,jsx,ts,tsx}"],
      },
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.test.{js,ts}"],
            exclude: [],
            environment: "node",
          },
        },
        {
          extends: true,
          test: {
            name: "ui",
            include: ["src/**/*.test.tsx"],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              screenshotDirectory: "vitest-test-results",
              instances: [{ browser: "chromium" }],
            },
          },
        },
      ],
      reporters: [
        "default",
        // conditional reporter
        process.env.CI ? "github-actions" : {},
      ],
    },
  }
})
