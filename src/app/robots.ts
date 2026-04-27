import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(Env.NEXT_PUBLIC_APP_URL
      ? { sitemap: `${Env.NEXT_PUBLIC_APP_URL}/sitemap.xml` }
      : {}),
  }
}
