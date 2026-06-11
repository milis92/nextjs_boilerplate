import { expect, test, type Page } from "@playwright/test"

// Guards the proxy matcher's prefetch exclusion (see src/proxy.ts): the proxy
// skips requests carrying prefetch headers, so a `next/link` prefetch must not
// poison the router cache with an un-proxied response. Clicking a next-intl
// link after its prefetch has fired must still land on the correct localized
// page.
//
// PRODUCTION ONLY: `next/link` prefetching is disabled in dev ("Prefetching is
// only enabled in production" — node_modules/next/dist/docs/01-app/
// 03-api-reference/02-components/link.md), so against `pnpm dev` these tests
// can never exercise the prefetch path. playwright.config.ts starts the
// production build (`pnpm start`) only on CI, so outside CI we skip loudly
// rather than pass without guarding anything.

test.skip(
  !process.env.CI,
  "next/link prefetch is disabled in dev, so this test is only meaningful against the production build CI runs (`pnpm start`). To run it locally, build and start the app, then run Playwright with CI=1."
)

// Resolves once the router has prefetched `pathname`: a response whose request
// carries the `next-router-prefetch` header — the exact marker src/proxy.ts's
// matcher excludes, so this response is the un-proxied payload the test must
// prove harmless. RACE: the link is in the initial HTML, so the prefetch fires
// on viewport entry immediately after hydration; waitForResponse only observes
// requests issued after it is installed, so this must be armed BEFORE
// page.goto(). Do NOT chain `.finished()` on the resolved response: Chromium's
// loadingFinished signal is flaky for RSC prefetch responses and the call
// hangs nondeterministically (the response itself completes in milliseconds).
function waitForPrefetch(page: Page, pathname: string) {
  return page.waitForResponse(async (response) => {
    if (new URL(response.url()).pathname !== pathname) return false
    const prefetchHeader = await response
      .request()
      .headerValue("next-router-prefetch")
    return prefetchHeader !== null
  })
}

test("German not-found page navigates home after prefetch", async ({
  page,
}) => {
  const prefetched = waitForPrefetch(page, "/de")
  await page.goto("/de/this-route-does-not-exist")

  const homeLink = page.getByRole("link", { name: "Zur Startseite" })
  await expect(homeLink).toBeVisible()
  // Precondition: the prefetch response must have arrived before the click,
  // otherwise this is an ordinary navigation that proves nothing about the
  // prefetched cache entry.
  await prefetched

  await homeLink.click()
  await expect(
    page.getByRole("heading", { name: /projekt bereit/i })
  ).toBeVisible()
  await expect(page).toHaveURL("/de")
})

test("default-locale not-found page navigates home after prefetch", async ({
  page,
}) => {
  const prefetched = waitForPrefetch(page, "/")
  await page.goto("/this-route-does-not-exist")

  const homeLink = page.getByRole("link", { name: "Back to home" })
  await expect(homeLink).toBeVisible()
  // Precondition: see the German test above.
  await prefetched

  await homeLink.click()
  await expect(
    page.getByRole("heading", { name: /project ready/i })
  ).toBeVisible()
  await expect(page).toHaveURL("/")
})
