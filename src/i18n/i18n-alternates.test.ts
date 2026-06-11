import { describe, expect, it } from "vitest"

import { languageAlternates, localePath } from "@/i18n/i18n-alternates"
import { routing } from "@/i18n/i18n-routing"

const nonDefaultLocales = routing.locales.filter(
  (locale) => locale !== routing.defaultLocale
)

// Several suites below loop over nonDefaultLocales; with a single configured
// locale those loops would assert nothing and pass vacuously.
it("has at least one non-default locale to exercise prefixing", () => {
  expect(nonDefaultLocales.length).toBeGreaterThan(0)
})

describe("localePath", () => {
  // With localePrefix "as-needed" the proxy never serves /<defaultLocale>/* —
  // a prefixed canonical would point search engines at a redirecting URL.
  it("leaves the default locale unprefixed", () => {
    expect(localePath(routing.defaultLocale, "/about")).toBe("/about")
  })

  // The locale root must be "/" — an empty string is not a valid path and
  // would produce a canonical equal to the bare base URL with no path.
  it("returns '/' for the default locale root", () => {
    expect(localePath(routing.defaultLocale)).toBe("/")
  })

  it("prefixes non-default locales", () => {
    for (const locale of nonDefaultLocales) {
      expect(localePath(locale, "/about")).toBe(`/${locale}/about`)
    }
  })

  // No trailing slash: /de and /de/ are distinct URLs to crawlers, and the
  // app only serves the former.
  it("returns '/<locale>' for a non-default locale root", () => {
    for (const locale of nonDefaultLocales) {
      expect(localePath(locale)).toBe(`/${locale}`)
    }
  })
})

describe("languageAlternates", () => {
  // Google ignores hreflang clusters where any page is missing its
  // self-reference, so every configured locale must appear — including the
  // default — plus x-default, and nothing else.
  it("emits exactly one entry per locale plus x-default", () => {
    const languages = languageAlternates("/about")
    expect(Object.keys(languages).sort()).toEqual(
      [...routing.locales, "x-default"].sort()
    )
  })

  // x-default tells crawlers where unmatched languages land; it must point at
  // the same URL as the default locale or the cluster is inconsistent.
  it("points x-default at the default-locale URL", () => {
    const languages = languageAlternates("/about", "https://example.com")
    expect(languages["x-default"]).toBe(languages[routing.defaultLocale])
  })

  // Layout metadata passes no baseUrl and relies on Next.js resolving the
  // paths against metadataBase — so they must be root-relative paths.
  it("returns root-relative paths when no baseUrl is given", () => {
    const languages = languageAlternates("/about")
    for (const href of Object.values(languages)) {
      expect(href).toMatch(/^\//)
    }
  })

  // The sitemap passes NEXT_PUBLIC_APP_URL (no trailing slash, per
  // .env.example) — joining must yield valid absolute URLs with no doubled
  // or missing slashes, or the sitemap and layout would disagree.
  it("joins baseUrl and path into valid absolute URLs", () => {
    const baseUrl = "https://example.com"
    const languages = languageAlternates("/about", baseUrl)

    expect(languages[routing.defaultLocale]).toBe("https://example.com/about")
    for (const locale of nonDefaultLocales) {
      expect(languages[locale]).toBe(`https://example.com/${locale}/about`)
    }
    for (const href of Object.values(languages)) {
      // Normalizing through URL must be a no-op — catches "//" and "" paths.
      expect(new URL(href).toString()).toBe(href)
    }
  })

  // The root route ("" in the sitemap) is the edge case: the default locale
  // must resolve to baseUrl + "/", not the bare baseUrl or baseUrl + "//".
  it("handles the root route for every locale", () => {
    const baseUrl = "https://example.com"
    const languages = languageAlternates("", baseUrl)

    expect(languages[routing.defaultLocale]).toBe("https://example.com/")
    expect(languages["x-default"]).toBe("https://example.com/")
    for (const locale of nonDefaultLocales) {
      expect(languages[locale]).toBe(`https://example.com/${locale}`)
    }
  })
})
