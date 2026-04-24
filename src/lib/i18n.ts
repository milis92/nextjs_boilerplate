import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { AppConfig, isLocale, type Locale } from "@/utils/app-config"

async function loadMessages(locale: Locale) {
  return (await import(`../locales/${locale}.json`)).default
}

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(AppConfig.i18n.cookieName)?.value
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : AppConfig.i18n.defaultLocale

  try {
    return { locale, messages: await loadMessages(locale) }
  } catch (error) {
    console.error(
      `[i18n] Failed to load locale "${locale}"; falling back to "${AppConfig.i18n.defaultLocale}".`,
      error
    )
    return {
      locale: AppConfig.i18n.defaultLocale,
      messages: await loadMessages(AppConfig.i18n.defaultLocale),
    }
  }
})
