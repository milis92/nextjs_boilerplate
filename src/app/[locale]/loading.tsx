import { useTranslations } from "next-intl"

// Instant Suspense fallback for the locale segment. Stays a Server Component —
// `useTranslations` works in non-async Server Components, so the label doesn't
// need the client provider (or its `messages` subset) at all.
export default function Loading() {
  const t = useTranslations("Loading")

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh items-center justify-center p-6"
    >
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground"
      />
      <span className="sr-only">{t("label")}</span>
    </div>
  )
}
