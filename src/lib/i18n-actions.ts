"use server"

import { cookies } from "next/headers"
import { AppConfig, isLocale, type Locale } from "@/utils/app-config"
import { Env } from "@/lib/env"

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) {
    console.warn(`[i18n] setLocale called with invalid locale: ${locale}`)
    return
  }
  ;(await cookies()).set(AppConfig.i18n.cookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: Env.NODE_ENV === "production",
  })
}
