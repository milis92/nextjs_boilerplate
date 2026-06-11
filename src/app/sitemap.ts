import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"
import { languageAlternates } from "@/i18n/i18n-alternates"

// Add all public-facing routes here when new pages are created.
// Each entry is a path relative to the locale root:
//   ""        → /
//   "/about"  → /about
const PUBLIC_ROUTES = [""]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL

  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    alternates: {
      languages: languageAlternates(route, baseUrl),
    },
  }))
}
