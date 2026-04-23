import type messages from "@/locales/en.json"
import type { Locale } from "@/utils/app-config"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
