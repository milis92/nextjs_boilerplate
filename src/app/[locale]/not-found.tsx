import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/i18n-navigation"

// Rendered for `notFound()` thrown inside a valid locale segment (e.g. the
// `[...rest]` catch-all). The unknown-locale guard in `layout.tsx` is NOT
// caught here — it throws above `[locale]`, so the root `app/not-found.tsx`
// renders instead.
export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button asChild>
        <Link href="/">{t("home")}</Link>
      </Button>
    </div>
  )
}
