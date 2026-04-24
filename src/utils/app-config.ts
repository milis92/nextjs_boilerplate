import { Env } from "@/lib/env"

export const AppConfig = {
  name: Env.NEXT_PUBLIC_APP_NAME,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
    localePrefix: "as-needed",
    cookieName: "NEXT_LOCALE",
  },
} as const

export type Locale = (typeof AppConfig.i18n.locales)[number]

export function isLocale(value: string | undefined): value is Locale {
  return (
    !!value && (AppConfig.i18n.locales as readonly string[]).includes(value)
  )
}
