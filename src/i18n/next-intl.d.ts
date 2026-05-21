import type messages from "@/i18n/locales/en.json"
import type {Locale} from "@/app.config"

/**
 * Augments next-intl's AppConfig with the project's Locale union and typed message catalog.
 */
declare module "next-intl" {
    interface AppConfig {
        Locale: Locale
        Messages: typeof messages
    }
}
