import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function Page() {
  const t = useTranslations("Home")

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("ready")}</h1>
          <p>{t("startBuilding")}</p>
          <p>{t("buttonAdded")}</p>
          <Button className="mt-2">{t("button")}</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {t.rich("toggleDarkMode", { key: (chunks) => <kbd>{chunks}</kbd> })}
        </div>
      </div>
    </div>
  )
}
