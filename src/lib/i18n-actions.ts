"use server"

import { cookies } from "next/headers"
import { AppConfig, isLocale, type Locale } from "@/utils/app-config"

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) {
    console.warn(`[i18n] setLocale called with invalid locale: ${locale}`)
    return
  }
  ;(await cookies()).set(AppConfig.i18n.cookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}
