import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"
import { routing } from "@/i18n/i18n-routing"

// Add all public-facing routes here when new pages are created.
// Each entry is a path relative to the locale root:
//   ""        → /
//   "/about"  → /about
const PUBLIC_ROUTES = [""]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) return []

  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales
          .filter((locale) => locale !== routing.defaultLocale)
          .map((locale) => [locale, `${baseUrl}/${locale}${route}`])
      ),
    },
  }))
}
