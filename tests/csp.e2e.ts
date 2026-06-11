import { expect, test } from "@playwright/test"

// Guards the production CSP contract minted in src/proxy.ts. Its failure mode
// is silent: if the per-request nonce stops propagating (layout.tsx →
// Providers → next-themes' inline anti-FOUC script) or someone adds an
// un-nonced inline script, `strict-dynamic` blocks it, the page still renders,
// and other e2e tests stay green — prod ships with broken theme/dark-mode.
// These tests pin (1) the header shape and (2) that loading the page fires
// zero CSP violations.

test("navigation response carries the expected CSP header", async ({
  page,
}) => {
  const response = await page.goto("/")
  const cspHeader = response?.headers()["content-security-policy"] ?? ""
  expect(cspHeader).not.toBe("")

  const scriptSrc =
    cspHeader
      .split(";")
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith("script-src ")) ?? ""
  expect(scriptSrc).not.toBe("")

  // Branch on the environment the runner controls (CI runs `pnpm start`,
  // locally the webServer runs `pnpm dev` — see playwright.config.ts), NEVER
  // on the header under test: if the production build wrongly served the lax
  // dev policy, classifying the branch from the header would route that exact
  // regression into the dev assertions and pass.
  if (process.env.CI) {
    expect(scriptSrc).toContain("'nonce-")
    expect(scriptSrc).toContain("'strict-dynamic'")
    expect(scriptSrc).not.toContain("'unsafe-inline'")
    expect(scriptSrc).not.toContain("'unsafe-eval'")
  } else {
    // Dev policy: proxy.ts falls back to 'unsafe-inline'/'unsafe-eval' for
    // Turbopack HMR — there is no nonce or strict-dynamic to assert.
    expect(scriptSrc).toContain("'unsafe-inline'")
    expect(scriptSrc).toContain("'unsafe-eval'")
  }
})

test("home page loads and hydrates with zero CSP violations", async ({
  page,
}) => {
  const consoleCspErrors: string[] = []
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      // Chromium logs "Content Security Policy", Firefox "Content-Security-Policy".
      /content.security.policy/i.test(message.text())
    ) {
      consoleCspErrors.push(message.text())
    }
  })

  // Must be registered before navigation: violations for inline scripts
  // (next-themes' anti-FOUC script) fire during the initial HTML parse.
  await page.addInitScript(() => {
    const violations: string[] = []
    Object.defineProperty(window, "__cspViolations", { value: violations })
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(
        `${event.violatedDirective} blocked ${event.blockedURI || "inline"}`
      )
    })
  })

  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /project ready/i })
  ).toBeVisible()
  // Give post-load activity (hydration chunks, fonts, data fetches) a moment
  // to surface any late violations before reading the recorder.
  await page.waitForTimeout(1000)

  const violations = await page.evaluate(() => {
    const recorded = Reflect.get(window, "__cspViolations")
    if (!Array.isArray(recorded)) {
      // Fail loud: a missing recorder means the init script never installed,
      // and "zero violations" would be measuring nothing.
      throw new Error("CSP violation recorder was not installed")
    }
    return recorded.map(String)
  })
  expect(violations).toEqual([])
  expect(consoleCspErrors).toEqual([])
})
