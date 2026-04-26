# App Router Special Files + Public SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Next.js App Router special files (loading, error, not-found, global-error) and a public SEO surface (metadata, sitemap, robots, OG image) to the boilerplate.

**Architecture:** Gap 1 adds four special-file components under `src/app/[locale]/`. Gap 2 extracts metadata builders into `src/app/[locale]/metadata.ts`, wires them via `generateMetadata` exports in layout and page, and adds root-level `sitemap.ts`, `robots.ts`, and `src/app/[locale]/opengraph-image.tsx`. No new npm packages.

**Tech Stack:** Next.js 16 App Router, next-intl v4, @t3-oss/env-nextjs + Zod, Tailwind CSS 4, Vitest (unit/Node + browser/Playwright), vitest-browser-react.

---

### Task 1: Translation keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/de.json`

- [ ] **Step 1: Add Error and NotFound keys to en.json**

Replace the contents of `src/i18n/locales/en.json` with:

```json
{
  "Common": {
    "appName": "nextjs_boilerplate"
  },
  "Home": {
    "ready": "Project ready!",
    "startBuilding": "You may now add components and start building.",
    "buttonAdded": "We've already added the button component for you.",
    "button": "Button",
    "toggleDarkMode": "Press <key>D</key> to toggle dark mode"
  },
  "Error": {
    "title": "Something went wrong",
    "description": "An unexpected error occurred.",
    "retry": "Try again"
  },
  "NotFound": {
    "title": "Page not found",
    "description": "The page you are looking for doesn't exist.",
    "back": "Back to home"
  }
}
```

- [ ] **Step 2: Add German equivalents to de.json**

Replace the contents of `src/i18n/locales/de.json` with:

```json
{
  "Common": {
    "appName": "nextjs_boilerplate"
  },
  "Home": {
    "ready": "Projekt bereit!",
    "startBuilding": "Du kannst jetzt Komponenten hinzufügen und loslegen.",
    "buttonAdded": "Wir haben den Button bereits für dich hinzugefügt.",
    "button": "Button",
    "toggleDarkMode": "Drücke <key>D</key> für den Dunkelmodus"
  },
  "Error": {
    "title": "Etwas ist schiefgelaufen",
    "description": "Ein unerwarteter Fehler ist aufgetreten.",
    "retry": "Erneut versuchen"
  },
  "NotFound": {
    "title": "Seite nicht gefunden",
    "description": "Die gesuchte Seite existiert nicht.",
    "back": "Zurück zur Startseite"
  }
}
```

- [ ] **Step 3: Run typecheck to verify keys are picked up**

```bash
pnpm typecheck
```

Expected: no errors. The `next-intl.d.ts` augmentation makes `useTranslations` key-safe.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/de.json
git commit -m "feat: add Error and NotFound i18n keys"
```

---

### Task 2: loading.tsx

**Files:**
- Create: `src/app/[locale]/loading.tsx`

- [ ] **Step 1: Create the loading skeleton**

Create `src/app/[locale]/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
```

No i18n or providers needed — this is a pure UI skeleton shown before any React tree mounts.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/loading.tsx
git commit -m "feat: add loading skeleton for locale segment"
```

---

### Task 3: error.tsx + test

**Files:**
- Create: `src/app/[locale]/error.tsx`
- Create: `src/app/[locale]/error.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/[locale]/error.test.tsx`:

```tsx
import { render } from "vitest-browser-react"
import { NextIntlClientProvider } from "next-intl"
import { expect, test, vi } from "vitest"
import ErrorPage from "./error"

const messages = {
  Error: {
    title: "Something went wrong",
    description: "An unexpected error occurred.",
    retry: "Try again",
  },
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

test("renders heading and retry button", async () => {
  const reset = vi.fn()
  const screen = render(<ErrorPage error={new Error("test")} reset={reset} />, {
    wrapper,
  })
  await expect
    .element(screen.getByRole("heading", { name: "Something went wrong" }))
    .toBeInTheDocument()
  await expect
    .element(screen.getByRole("button", { name: "Try again" }))
    .toBeInTheDocument()
})

test("calls reset when retry button is clicked", async () => {
  const reset = vi.fn()
  const screen = render(<ErrorPage error={new Error("test")} reset={reset} />, {
    wrapper,
  })
  await screen.getByRole("button", { name: "Try again" }).click()
  expect(reset).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test -- --project=ui --reporter=verbose src/app/\\[locale\\]/error.test.tsx
```

Expected: FAIL — `./error` module not found.

- [ ] **Step 3: Implement error.tsx**

Create `src/app/[locale]/error.tsx`:

```tsx
"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("Error")

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("description")}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t("retry")}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test -- --project=ui --reporter=verbose src/app/\\[locale\\]/error.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/error.tsx src/app/[locale]/error.test.tsx
git commit -m "feat: add error boundary for locale segment"
```

---

### Task 4: not-found.tsx + test

**Files:**
- Create: `src/app/[locale]/not-found.tsx`
- Create: `src/app/[locale]/not-found.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/[locale]/not-found.test.tsx`:

```tsx
import { render } from "vitest-browser-react"
import { NextIntlClientProvider } from "next-intl"
import { expect, test, vi } from "vitest"
import NotFoundPage from "./not-found"

// Link from next-intl navigation needs Next.js router context that isn't
// available in browser tests. Replace with a plain anchor for testing.
vi.mock("@/i18n/i18n-navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={String(href)}>{children}</a>,
}))

const messages = {
  NotFound: {
    title: "Page not found",
    description: "The page you are looking for doesn't exist.",
    back: "Back to home",
  },
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

test("renders heading and back link", async () => {
  const screen = render(<NotFoundPage />, { wrapper })
  await expect
    .element(screen.getByRole("heading", { name: "Page not found" }))
    .toBeInTheDocument()
  await expect
    .element(screen.getByRole("link", { name: "Back to home" }))
    .toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test -- --project=ui --reporter=verbose src/app/\\[locale\\]/not-found.test.tsx
```

Expected: FAIL — `./not-found` module not found.

- [ ] **Step 3: Implement not-found.tsx**

Create `src/app/[locale]/not-found.tsx`:

```tsx
"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/i18n-navigation"

export default function NotFound() {
  const t = useTranslations("NotFound")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("description")}</p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t("back")}
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test -- --project=ui --reporter=verbose src/app/\\[locale\\]/not-found.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/not-found.tsx src/app/[locale]/not-found.test.tsx
git commit -m "feat: add 404 not-found page for locale segment"
```

---

### Task 5: global-error.tsx

**Files:**
- Create: `src/app/global-error.tsx`

`global-error.tsx` sits at the app root and catches errors thrown inside the root layout. At that level no providers (theme, i18n, Urql) are mounted, so it must render its own `<html><body>` and cannot use next-intl hooks. Hardcoded English strings are acceptable here.

- [ ] **Step 1: Create global-error.tsx**

Create `src/app/global-error.tsx`:

```tsx
"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100svh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#71717a", margin: 0 }}>
          An unexpected error occurred.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#18181b",
            color: "#fafafa",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/global-error.tsx
git commit -m "feat: add global error boundary for root layout errors"
```

---

### Task 6: metadata.ts + test

**Files:**
- Create: `src/app/[locale]/metadata.ts`
- Create: `src/app/[locale]/metadata.test.ts`

`metadata.ts` holds the pure metadata builder functions. Keeping them here makes them unit-testable without importing the full layout (which brings in fonts and CSS).

- [ ] **Step 1: Write the failing tests**

Create `src/app/[locale]/metadata.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  Env: {
    NEXT_PUBLIC_APP_NAME: "Test App",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_REST_URL: "http://localhost:3001",
    NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
    NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
    NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
    NODE_ENV: "test",
  },
}))

import { buildBaseMetadata, buildHomeMetadata } from "./metadata"

describe("buildBaseMetadata", () => {
  test("sets title with default and template including app name", () => {
    const meta = buildBaseMetadata("en")
    expect(meta.title).toEqual({
      default: "Test App",
      template: "%s | Test App",
    })
  })

  test("sets applicationName from env", () => {
    const meta = buildBaseMetadata("en")
    expect(meta.applicationName).toBe("Test App")
  })

  test("sets metadataBase to APP_URL", () => {
    const meta = buildBaseMetadata("en")
    expect(meta.metadataBase?.toString()).toBe("https://example.com/")
  })

  test("maps en to / and de to /de in hreflang alternates", () => {
    const meta = buildBaseMetadata("en")
    expect(
      (meta.alternates as { languages?: Record<string, string> })?.languages
    ).toEqual({
      en: "https://example.com/",
      de: "https://example.com/de",
    })
  })

  test("sets open graph type to website", () => {
    const meta = buildBaseMetadata("en")
    expect(meta.openGraph?.type).toBe("website")
  })

  test("sets twitter card to summary_large_image", () => {
    const meta = buildBaseMetadata("en")
    expect(meta.twitter?.card).toBe("summary_large_image")
  })
})

describe("buildHomeMetadata", () => {
  test("overrides title to app name without template suffix", () => {
    const meta = buildHomeMetadata("en")
    expect(meta.title).toBe("Test App")
  })

  test("sets canonical to root URL for default locale", () => {
    const meta = buildHomeMetadata("en")
    expect(
      (meta.alternates as { canonical?: string })?.canonical
    ).toBe("https://example.com/")
  })

  test("sets canonical to /de for German locale", () => {
    const meta = buildHomeMetadata("de")
    expect(
      (meta.alternates as { canonical?: string })?.canonical
    ).toBe("https://example.com/de")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/\\[locale\\]/metadata.test.ts
```

Expected: FAIL — `./metadata` module not found.

- [ ] **Step 3: Implement metadata.ts**

Create `src/app/[locale]/metadata.ts`:

```ts
import type { Metadata } from "next"
import { AppConfig } from "@/app.config"
import { Env } from "@/lib/env"

function localePath(locale: string): string {
  const isDefault =
    AppConfig.i18n.localePrefix === "as-needed" &&
    locale === AppConfig.i18n.defaultLocale
  return isDefault ? "/" : `/${locale}`
}

export function buildBaseMetadata(locale: string): Metadata {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  const appName = Env.NEXT_PUBLIC_APP_NAME

  return {
    title: { default: appName, template: `%s | ${appName}` },
    description: "Your app description",
    applicationName: appName,
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
    openGraph: {
      type: "website",
      siteName: appName,
      title: appName,
      description: "Your app description",
    },
    twitter: { card: "summary_large_image" },
    ...(baseUrl
      ? {
          alternates: {
            languages: Object.fromEntries(
              AppConfig.i18n.locales.map((l) => [
                l,
                `${baseUrl}${localePath(l)}`,
              ])
            ),
          },
        }
      : {}),
  }
}

export function buildHomeMetadata(locale: string): Metadata {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  const appName = Env.NEXT_PUBLIC_APP_NAME

  return {
    title: appName,
    ...(baseUrl
      ? { alternates: { canonical: `${baseUrl}${localePath(locale)}` } }
      : {}),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/\\[locale\\]/metadata.test.ts
```

Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/metadata.ts src/app/[locale]/metadata.test.ts
git commit -m "feat: add locale-aware metadata builders"
```

---

### Task 7: Wire generateMetadata into layout.tsx and page.tsx

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add generateMetadata to layout.tsx**

The current `src/app/[locale]/layout.tsx` starts with these imports:

```tsx
import { hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Roboto } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import "@/styles/globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/components/ui/cn"
import { routing } from "@/i18n/i18n-routing"
```

Add these two lines after the existing imports:

```tsx
import type { Metadata } from "next"
import { buildBaseMetadata } from "./metadata"
```

Then add this export before the existing `generateStaticParams` export:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildBaseMetadata(locale)
}
```

The file should now look like:

```tsx
import { hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Roboto } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import "@/styles/globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/components/ui/cn"
import { routing } from "@/i18n/i18n-routing"
import type { Metadata } from "next"
import { buildBaseMetadata } from "./metadata"

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" })
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildBaseMetadata(locale)
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        robotoHeading.variable
      )}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Add generateMetadata to page.tsx**

The current `src/app/[locale]/page.tsx` is:

```tsx
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
```

Replace it with:

```tsx
import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { buildHomeMetadata } from "./metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildHomeMetadata(locale)
}

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
```

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx src/app/[locale]/page.tsx
git commit -m "feat: wire generateMetadata into locale layout and home page"
```

---

### Task 8: sitemap.ts + test

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/sitemap.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/sitemap.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  Env: {
    NEXT_PUBLIC_APP_NAME: "Test App",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_REST_URL: "http://localhost:3001",
    NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
    NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
    NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
    NODE_ENV: "test",
  },
}))

import sitemap from "./sitemap"

describe("sitemap", () => {
  test("returns one entry per locale for the home route", () => {
    const entries = sitemap()
    expect(entries).toHaveLength(2)
  })

  test("en entry URL is the bare root", () => {
    const entries = sitemap()
    expect(entries[0]!.url).toBe("https://example.com/")
  })

  test("de entry URL has /de prefix", () => {
    const entries = sitemap()
    expect(entries[1]!.url).toBe("https://example.com/de")
  })

  test("each entry includes alternates.languages for all locales", () => {
    const entries = sitemap()
    expect(entries[0]!.alternates?.languages).toEqual({
      en: "https://example.com/",
      de: "https://example.com/de",
    })
  })
})

describe("sitemap with no APP_URL", () => {
  test("returns an empty array", async () => {
    vi.doMock("@/lib/env", () => ({
      Env: {
        NEXT_PUBLIC_APP_NAME: "Test App",
        NEXT_PUBLIC_APP_URL: undefined,
        NEXT_PUBLIC_REST_URL: "http://localhost:3001",
        NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
        NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
        NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
        NODE_ENV: "test",
      },
    }))
    vi.resetModules()
    const { default: sitemapFn } = await import("./sitemap")
    expect(sitemapFn()).toEqual([])
    vi.doUnmock("@/lib/env")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/sitemap.test.ts
```

Expected: FAIL — `./sitemap` module not found.

- [ ] **Step 3: Implement sitemap.ts**

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next"
import { AppConfig } from "@/app.config"
import { Env } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) return []

  const routes = ["/"]
  const { locales, defaultLocale, localePrefix } = AppConfig.i18n

  function url(locale: string, route: string): string {
    const isDefault = localePrefix === "as-needed" && locale === defaultLocale
    if (isDefault) {
      return route === "/" ? `${baseUrl}/` : `${baseUrl}${route}`
    }
    return route === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${route}`
  }

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: url(locale, route),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, url(l, route)])),
      },
    }))
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/sitemap.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat: add sitemap with per-locale entries"
```

---

### Task 9: robots.ts + test

**Files:**
- Create: `src/app/robots.ts`
- Create: `src/app/robots.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/robots.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  Env: {
    NEXT_PUBLIC_APP_NAME: "Test App",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_REST_URL: "http://localhost:3001",
    NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
    NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
    NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
    NODE_ENV: "test",
  },
}))

import robots from "./robots"

describe("robots", () => {
  test("allows all user agents", () => {
    const result = robots()
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" })
  })

  test("includes sitemap URL when APP_URL is set", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://example.com/sitemap.xml")
  })
})

describe("robots with no APP_URL", () => {
  test("omits sitemap field", async () => {
    vi.doMock("@/lib/env", () => ({
      Env: {
        NEXT_PUBLIC_APP_NAME: "Test App",
        NEXT_PUBLIC_APP_URL: undefined,
        NEXT_PUBLIC_REST_URL: "http://localhost:3001",
        NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
        NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
        NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
        NODE_ENV: "test",
      },
    }))
    vi.resetModules()
    const { default: robotsFn } = await import("./robots")
    const result = robotsFn()
    expect(result.sitemap).toBeUndefined()
    vi.doUnmock("@/lib/env")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/robots.test.ts
```

Expected: FAIL — `./robots` module not found.

- [ ] **Step 3: Implement robots.ts**

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next"
import { Env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- --project=unit --reporter=verbose src/app/robots.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/robots.ts src/app/robots.test.ts
git commit -m "feat: add robots.txt handler"
```

---

### Task 10: opengraph-image.tsx

**Files:**
- Create: `src/app/[locale]/opengraph-image.tsx`

This runs on the Edge runtime and returns an `ImageResponse`. Automated testing is not practical (Edge APIs aren't available in Vitest or Node); typecheck is the verification gate.

`opengraph-image.tsx` lives inside `[locale]/` because there is no root `src/app/layout.tsx` — Next.js inherits OG images from the nearest enclosing layout, which is the locale layout.

- [ ] **Step 1: Create opengraph-image.tsx**

Create `src/app/[locale]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og"
import { Env } from "@/lib/env"

export const runtime = "edge"

export const alt = Env.NEXT_PUBLIC_APP_NAME
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#fafafa",
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          {Env.NEXT_PUBLIC_APP_NAME}
        </p>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```bash
pnpm test
```

Expected: all existing tests pass, no new failures.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/opengraph-image.tsx
git commit -m "feat: add default OG image for locale segment"
```
