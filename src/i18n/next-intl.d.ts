import type messages from "@/i18n/locales/en.json"
import type { Locale } from "@/app.config"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
