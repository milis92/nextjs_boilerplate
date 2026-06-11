"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

/**
 * Visible, primary affordance for theme switching — the keyboard "D" shortcut
 * (see ThemeHotkey) is kept only as an enhancement. The icon swap is driven by
 * the `dark` class via CSS (not `resolvedTheme`), so it renders correctly on the
 * server and avoids a hydration mismatch. Toggling announces the new theme to
 * assistive tech via a polite live region.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("Theme")
  const [announcement, setAnnouncement] = useState("")

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
    setAnnouncement(next === "dark" ? t("dark") : t("light"))
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-keyshortcuts="d"
        aria-label={t("toggle")}
        title={t("toggle")}
        onClick={toggle}
        className="fixed top-4 right-4 z-50"
      >
        <Sun className="block dark:hidden" aria-hidden="true" />
        <Moon className="hidden dark:block" aria-hidden="true" />
      </Button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  )
}
