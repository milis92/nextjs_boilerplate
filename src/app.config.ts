import { Env } from "@/lib/env"

export const AppConfig = {
  name: Env.NEXT_PUBLIC_APP_NAME,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
} as const

export type Locale = (typeof AppConfig.i18n.locales)[number]
