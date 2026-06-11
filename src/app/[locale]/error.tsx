"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  // This boundary lives inside `[locale]/layout.tsx`, which mounts
  // NextIntlClientProvider above it, so client i18n hooks are in scope.
  // (global-error.tsx replaces the root layout and stays hardcoded.)
  const t = useTranslations("Error")

  useEffect(() => {
    // Next.js logs the full error server-side (correlated by `error.digest`) and
    // passes only a sanitized error to the client. Wire a client error-reporting
    // SDK (e.g. Sentry) here to capture client-side context.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button onClick={() => unstable_retry()}>{t("retry")}</Button>
    </div>
  )
}
