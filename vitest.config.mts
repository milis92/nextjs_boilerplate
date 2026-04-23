import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    coverage: {
      include: ["app/**/*", "components/**/*", "lib/**/*", "hooks/**/*"],
      exclude: ["**/*.stories.{js,jsx,ts,tsx}"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["lib/**/*.test.{js,ts}", "app/**/*.test.{js,ts}"],
          exclude: ["hooks/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          include: ["**/*.test.tsx", "hooks/**/*.test.ts"],
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
    env: loadEnv("", process.cwd(), ""), // Expose .env variables to Node.js
  },
})
