import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${Env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
