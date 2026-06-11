import { routing } from "@/i18n/i18n-routing"

// Locale-prefixed path for a route, honoring `as-needed` (default locale is
// unprefixed): localePath("de", "/about") → "/de/about".
export function localePath(locale: string, route = "") {
  return locale === routing.defaultLocale ? route || "/" : `/${locale}${route}`
}

// hreflang map shared by layout metadata and the sitemap so both emit the same
// cluster — every locale including the default self-reference, plus x-default.
// Google treats inconsistent clusters as invalid, so never build these by hand.
// Pass `baseUrl` where absolute URLs are required (sitemap); leave it empty
// where relative paths are resolved against `metadataBase` (layout metadata).
export function languageAlternates(route = "", baseUrl = "") {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      `${baseUrl}${localePath(locale, route)}`,
    ])
  )
  languages["x-default"] =
    `${baseUrl}${localePath(routing.defaultLocale, route)}`
  return languages
}
