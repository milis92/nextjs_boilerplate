# i18n Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom cookie-based locale system with URL-primary routing that matches the ixartz/Next-js-Boilerplate i18n architecture, keeping `en`/`de` locales.

**Architecture:** next-intl middleware (`src/proxy.ts`) intercepts every request and resolves the locale from the URL segment, a cookie hint, then `Accept-Language`. The locale is encoded in the URL with `localePrefix: 'as-needed'` (English at `/`, German at `/de`). All app routes move under `src/app/[locale]/` and a new `src/i18n/` module centralises routing config, request config, and navigation helpers.

**Tech Stack:** next-intl 4.9.1, Next.js 16.2.4 (App Router), TypeScript 5.9

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/i18n/I18nRouting.ts` | `defineRouting` config — single source of truth for locales and prefix |
| Create | `src/i18n/I18n.ts` | `getRequestConfig` — loads messages from URL locale |
| Create | `src/i18n/I18nNavigation.ts` | Locale-aware `Link`, `usePathname`, `useRouter` |
| Create | `src/i18n/locales/en.json` | English messages (moved) |
| Create | `src/i18n/locales/de.json` | German messages (moved) |
| Create | `src/proxy.ts` | Next.js 16 proxy (was middleware) — runs next-intl locale routing |
| Create | `src/app/[locale]/layout.tsx` | Root locale layout (replaces flat layout) |
| Create | `src/app/[locale]/page.tsx` | Home page (moved, content unchanged) |
| Rename | `src/types/i18n.ts` → `src/types/I18n.ts` | Type augmentation — update import paths only |
| Modify | `src/utils/app-config.ts` | Add `localePrefix`, remove `cookieName` + `isLocale` |
| Modify | `next.config.ts` | Point next-intl plugin at `src/i18n/I18n.ts` |
| Modify | `knip.config.ts` | Update ignore entries for new paths |
| Modify | `tests/home.e2e.ts` | Switch German test from cookie to URL navigation |
| Modify | `README.md` | Update stale i18n references |
| Delete | `src/lib/i18n.ts` | Replaced by `src/i18n/I18n.ts` |
| Delete | `src/lib/i18n-actions.ts` | No longer needed — locale is in the URL |
| Delete | `src/locales/en.json` | Moved to `src/i18n/locales/en.json` |
| Delete | `src/locales/de.json` | Moved to `src/i18n/locales/de.json` |
| Delete | `src/app/layout.tsx` | Replaced by `src/app/[locale]/layout.tsx` |
| Delete | `src/app/page.tsx` | Replaced by `src/app/[locale]/page.tsx` |

---

### Task 1: Write failing e2e test (TDD)

Update the German locale test to use URL navigation instead of cookies. The test will fail until the implementation is complete.

**Files:**
- Modify: `tests/home.e2e.ts`

- [ ] **Step 1.1: Start the dev server in a separate terminal**

```bash
pnpm dev
```

Leave it running. All e2e tests need it. Playwright uses port 3008 by default (see `playwright.config.ts`).

- [ ] **Step 1.2: Run current e2e tests to confirm they pass**

```bash
pnpm test:e2e
```

Expected: both tests pass (English and German cookie-based).

- [ ] **Step 1.3: Replace `tests/home.e2e.ts` with the URL-based German test**

```ts
import { expect, test } from "@playwright/test"

test("home page renders localized heading in English", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /project ready/i })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: /button/i })).toBeVisible()
})

test("home page renders German heading at /de", async ({ page }) => {
  await page.goto("/de")
  await expect(
    page.getByRole("heading", { name: /projekt bereit/i })
  ).toBeVisible()
})
```

- [ ] **Step 1.4: Run e2e tests — confirm the German test fails**

```bash
pnpm test:e2e
```

Expected: English test passes, German test fails (404 or wrong content — `/de` route doesn't exist yet). This is correct.

- [ ] **Step 1.5: Commit**

```bash
git add tests/home.e2e.ts
git commit -m "test: update German locale e2e to URL-based routing"
```

---

### Task 2: Add `localePrefix` to `AppConfig`

Add `localePrefix` while keeping `cookieName` and `isLocale` alive — they are still used by the old `src/lib/i18n.ts` and `src/lib/i18n-actions.ts` which are not deleted yet.

**Files:**
- Modify: `src/utils/app-config.ts`

- [ ] **Step 2.1: Edit `src/utils/app-config.ts`**

```ts
import { Env } from "@/lib/env"

export const AppConfig = {
  name: Env.NEXT_PUBLIC_APP_NAME,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
    localePrefix: "as-needed",
    cookieName: "NEXT_LOCALE",
  },
} as const

export type Locale = (typeof AppConfig.i18n.locales)[number]

export function isLocale(value: string | undefined): value is Locale {
  return (
    !!value && (AppConfig.i18n.locales as readonly string[]).includes(value)
  )
}
```

- [ ] **Step 2.2: Type-check**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/utils/app-config.ts
git commit -m "refactor: add localePrefix to AppConfig i18n config"
```

---

### Task 3: Create `src/i18n/` module

Create the four new files and copy the locale JSONs. Also update `knip.config.ts` now so the pre-commit hook stays green throughout the remaining tasks.

**Files:**
- Create: `src/i18n/I18nRouting.ts`
- Create: `src/i18n/I18n.ts`
- Create: `src/i18n/I18nNavigation.ts`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/de.json`
- Modify: `knip.config.ts`

- [ ] **Step 3.1: Create `src/i18n/I18nRouting.ts`**

```ts
import { defineRouting } from "next-intl/routing"
import { AppConfig } from "@/utils/app-config"

export const routing = defineRouting({
  locales: AppConfig.i18n.locales,
  localePrefix: AppConfig.i18n.localePrefix,
  defaultLocale: AppConfig.i18n.defaultLocale,
})
```

- [ ] **Step 3.2: Create `src/i18n/I18n.ts`**

```ts
import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { routing } from "./I18nRouting"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3.3: Create `src/i18n/I18nNavigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation"
import { routing } from "./I18nRouting"

export const { Link, usePathname, useRouter } = createNavigation(routing)
```

- [ ] **Step 3.4: Create `src/i18n/locales/en.json`**

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
    "toggleDarkMode": "Press {key} to toggle dark mode"
  }
}
```

- [ ] **Step 3.5: Create `src/i18n/locales/de.json`**

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
    "toggleDarkMode": "Drücke {key} für den Dunkelmodus"
  }
}
```

- [ ] **Step 3.6: Update `knip.config.ts` — add new i18n file ignores**

`src/i18n/I18n.ts` is only referenced as a string in `next.config.ts` (knip won't trace it), and `src/i18n/I18nNavigation.ts` has no consumers yet. Both need to be ignored. Keep the old entries — those files still exist until Task 8.

```ts
import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/lib/i18n.ts",
    "src/lib/i18n-actions.ts",
    "src/types/i18n.ts",
    "src/utils/app-config.ts",
    "src/i18n/I18n.ts",
    "src/i18n/I18nNavigation.ts",
  ],
  ignoreDependencies: [
    "@eslint/eslintrc",
    "vitest-browser-react",
    "better-auth",
    "openapi-fetch",
    "lucide-react",
    "openapi-typescript",
    "tsx",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
```

- [ ] **Step 3.7: Type-check and deps-check**

```bash
pnpm typecheck && pnpm check:deps
```

Expected: no errors, no new knip complaints.

- [ ] **Step 3.8: Commit**

```bash
git add src/i18n/ knip.config.ts
git commit -m "feat: add src/i18n/ module with routing config, request config, navigation, and locale files"
```

---

### Task 4: Create `src/proxy.ts`

Next.js 16 uses `proxy.ts` instead of `middleware.ts`. This file runs on every request and tells next-intl to handle locale routing. The import path `next-intl/middleware` is a library path (unchanged despite the file rename).

**Files:**
- Create: `src/proxy.ts`

- [ ] **Step 4.1: Create `src/proxy.ts`**

```ts
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/I18nRouting"

export default createMiddleware(routing)

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
```

The matcher excludes `_next` internals, `api` routes, and static files (any path containing a dot).

- [ ] **Step 4.2: Type-check**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: add src/proxy.ts for next-intl URL-primary locale routing"
```

---

### Task 5: Update `next.config.ts` to use the new `I18n.ts`

Switch the plugin path. The old `src/lib/i18n.ts` still exists at this point — that's fine. After this commit the app uses the new URL-based request config.

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 5.1: Update the plugin call at the bottom of `next.config.ts`**

Find this line:

```ts
const nextConfig = createNextIntlPlugin("./src/lib/i18n.ts")(baseConfig)
```

Replace with:

```ts
const nextConfig = createNextIntlPlugin("./src/i18n/I18n.ts")(baseConfig)
```

- [ ] **Step 5.2: Type-check**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add next.config.ts
git commit -m "refactor: switch next-intl plugin to src/i18n/I18n.ts"
```

---

### Task 6: Replace the root app layout and page

Create the `[locale]` versions, then delete the old flat files in the same commit. Both changes must land together — having two `<html>` roots active simultaneously is invalid.

Key changes from the old layout:
- The layout now receives `params: Promise<{ locale: string }>` from Next.js
- Locale is validated with `hasLocale` before use; invalid locales call `notFound()`
- `setRequestLocale(locale)` is called after validation to enable static rendering
- `getLocale()` is removed — locale comes from params instead
- `getMessages()` and `NextIntlClientProvider` are unchanged
- `globals.css` import path changes from `./globals.css` to `../globals.css` (one directory deeper)

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Delete: `src/app/layout.tsx`
- Delete: `src/app/page.tsx`

- [ ] **Step 6.1: Create the `[locale]` directory**

```bash
mkdir -p "src/app/[locale]"
```

- [ ] **Step 6.2: Create `src/app/[locale]/layout.tsx`**

```tsx
import { hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Roboto } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import "../globals.css"
import { Providers } from "@/app/providers"
import { cn } from "@/utils/cn"
import { routing } from "@/i18n/I18nRouting"

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" })
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

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

- [ ] **Step 6.3: Create `src/app/[locale]/page.tsx`**

Content is identical to the current `src/app/page.tsx` — just moves location:

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

- [ ] **Step 6.4: Delete the old root layout and page**

```bash
rm src/app/layout.tsx src/app/page.tsx
```

- [ ] **Step 6.5: Type-check**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6.6: Commit**

```bash
git add src/app/
git commit -m "feat: move app into src/app/[locale]/ for URL-based locale routing"
```

---

### Task 7: Rename type augmentation file

The file moves from `src/types/i18n.ts` (lowercase) to `src/types/I18n.ts` (capital I). The augmentation pattern (`declare module "next-intl"`) is unchanged — only the import paths update to point at `src/i18n/`.

**Files:**
- Create: `src/types/I18n.ts`
- Delete: `src/types/i18n.ts`
- Modify: `knip.config.ts`

- [ ] **Step 7.1: Create `src/types/I18n.ts`**

```ts
import type messages from "@/i18n/locales/en.json"
import type { Locale } from "@/utils/app-config"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
```

- [ ] **Step 7.2: Delete `src/types/i18n.ts`**

```bash
rm src/types/i18n.ts
```

- [ ] **Step 7.3: Update `knip.config.ts` — rename the types ignore entry**

Replace `"src/types/i18n.ts"` with `"src/types/I18n.ts"` in the ignore list:

```ts
import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/lib/i18n.ts",
    "src/lib/i18n-actions.ts",
    "src/types/I18n.ts",
    "src/utils/app-config.ts",
    "src/i18n/I18n.ts",
    "src/i18n/I18nNavigation.ts",
  ],
  ignoreDependencies: [
    "@eslint/eslintrc",
    "vitest-browser-react",
    "better-auth",
    "openapi-fetch",
    "lucide-react",
    "openapi-typescript",
    "tsx",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
```

- [ ] **Step 7.4: Type-check and deps-check**

```bash
pnpm typecheck && pnpm check:deps
```

Expected: no errors.

- [ ] **Step 7.5: Commit**

```bash
git add src/types/ knip.config.ts
git commit -m "refactor: rename types/i18n.ts to types/I18n.ts and update import paths"
```

---

### Task 8: Delete old i18n files, clean up `AppConfig`, finalise `knip.config.ts`

All consumers of the old `src/lib/i18n.ts`, `src/lib/i18n-actions.ts`, and `src/locales/` are gone. Delete the files, strip the now-unused `cookieName` and `isLocale` from `AppConfig`, and remove their stale knip ignore entries.

**Files:**
- Delete: `src/lib/i18n.ts`
- Delete: `src/lib/i18n-actions.ts`
- Delete: `src/locales/en.json`
- Delete: `src/locales/de.json`
- Modify: `src/utils/app-config.ts`
- Modify: `knip.config.ts`

- [ ] **Step 8.1: Delete old lib and locale files**

```bash
rm src/lib/i18n.ts src/lib/i18n-actions.ts
rm -r src/locales/
```

- [ ] **Step 8.2: Update `src/utils/app-config.ts` — remove `cookieName` and `isLocale`**

```ts
import { Env } from "@/lib/env"

export const AppConfig = {
  name: Env.NEXT_PUBLIC_APP_NAME,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
} as const

export type Locale = (typeof AppConfig.i18n.locales)[number]
```

- [ ] **Step 8.3: Finalise `knip.config.ts` — remove stale old-file entries**

Remove `"src/lib/i18n.ts"` and `"src/lib/i18n-actions.ts"` (those files are deleted):

```ts
import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignore: [
    "src/components/ui/**",
    "src/lib/auth.client.ts",
    "src/lib/rest.client.ts",
    "src/types/I18n.ts",
    "src/utils/app-config.ts",
    "src/i18n/I18n.ts",
    "src/i18n/I18nNavigation.ts",
  ],
  ignoreDependencies: [
    "@eslint/eslintrc",
    "vitest-browser-react",
    "better-auth",
    "openapi-fetch",
    "lucide-react",
    "openapi-typescript",
    "tsx",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
}

export default config
```

- [ ] **Step 8.4: Type-check and deps-check**

```bash
pnpm typecheck && pnpm check:deps
```

Expected: no errors.

- [ ] **Step 8.5: Commit**

```bash
git add -A
git commit -m "refactor: remove old i18n lib files and clean up AppConfig"
```

---

### Task 9: Update `README.md`

Fix every stale i18n reference. The changes below are the exact lines that need updating.

**Files:**
- Modify: `README.md`

- [ ] **Step 9.1: Update the Highlights bullet (line 18)**

Find:
```
- **Internationalisation** — next-intl with cookie-based locale switching (en + de included)
```

Replace with:
```
- **Internationalisation** — next-intl with URL-primary locale routing (en + de); English at `/`, German at `/de`
```

- [ ] **Step 9.2: Update the Project Structure block (lines 65–67)**

Find:
```
lib/              # Core wiring: auth client, GraphQL client, i18n, env
  gql/            # Auto-generated GraphQL types (do not edit manually)
locales/          # i18n message files (en.json, de.json)
```

Replace with:
```
lib/              # Core wiring: auth client, GraphQL client, env
  gql/            # Auto-generated GraphQL types (do not edit manually)
i18n/             # Internationalisation — routing config, request config, navigation helpers
  locales/        # Translation message files (en.json, de.json)
```

- [ ] **Step 9.3: Update the locale workflow section (lines 120–126)**

Find:
```
### Adding a locale or translation key

1. Add the new key to `locales/en.json` (and any other locale files).
2. Run `pnpm typecheck` — `types/i18n.ts` provides the type augmentation that makes `useTranslations` key-safe.
3. Use the key in a component via `const t = useTranslations('Namespace')`.

To add a new locale: add the locale code to `AppConfig.i18n.locales` in `utils/app-config.ts`, create `locales/<code>.json`, and add a translation file.
```

Replace with:
```
### Adding a locale or translation key

1. Add the new key to `src/i18n/locales/en.json` (and any other locale files).
2. Run `pnpm typecheck` — `src/types/I18n.ts` provides the type augmentation that makes `useTranslations` key-safe.
3. Use the key in a component via `const t = useTranslations('Namespace')`.

To add a new locale: add the locale code to `AppConfig.i18n.locales` in `src/utils/app-config.ts`, create `src/i18n/locales/<code>.json`, and add a translation file.
```

- [ ] **Step 9.4: Commit**

```bash
git add README.md
git commit -m "docs: update README i18n references to new src/i18n/ structure"
```

---

### Task 10: Verify — run the full e2e suite

Both tests should now pass: English at `/` and German at `/de`.

**Files:** none

- [ ] **Step 10.1: Ensure the dev server is running**

```bash
pnpm dev
```

- [ ] **Step 10.2: Run the full e2e suite**

```bash
pnpm test:e2e
```

Expected output:
```
✓ home page renders localized heading in English
✓ home page renders German heading at /de

2 passed
```

- [ ] **Step 10.3: Manually verify in browser**

Open `http://localhost:3008` — should show "Project ready!" in English.
Open `http://localhost:3008/de` — should show "Projekt bereit!" in German.

- [ ] **Step 10.4: Run the full pre-commit check suite**

```bash
pnpm typecheck && pnpm check:deps
```

Expected: no errors, no knip complaints.
