import {hasLocale} from "next-intl"
import {getRequestConfig} from "next-intl/server"
import {AppConfig} from "@/app.config"

/**
 * Resolves the active locale and loads its message catalog for every server request.
 */
export default getRequestConfig(async ({requestLocale}) => {
    const requested = await requestLocale
    const locale = hasLocale(AppConfig.i18n.locales, requested) ? requested : AppConfig.i18n.defaultLocale
    return {
        locale,
        messages: (await import(`./locales/${locale}.json`)).default,
    }
})
