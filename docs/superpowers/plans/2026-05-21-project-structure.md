# Project Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise `src/` to match the approved structure — `lib/` split into subdirectories by concern, `components/providers/` extracted, home page extracted to `_components/`, and `hooks/` directory created.

**Architecture:** Pure structural reorganisation — no logic changes anywhere. Files move and import paths update. TypeScript typecheck is the primary correctness signal after each task. Tasks are ordered so typecheck passes cleanly at the end of each one.

**Tech Stack:** Next.js 16.2, TypeScript strict, pnpm

**Spec:** `docs/superpowers/specs/2026-05-21-project-structure-design.md`

---

## File Map

| Action | Path                                          |
| ------ | --------------------------------------------- |
| Create | `src/lib/auth/client.ts`                      |
| Create | `src/lib/graphql/client.ts`                   |
| Create | `src/lib/rest/client.ts`                      |
| Delete | `src/lib/auth.client.ts`                      |
| Delete | `src/lib/graphql.client.ts`                   |
| Delete | `src/lib/rest.client.ts`                      |
| Create | `src/components/providers/providers.tsx`      |
| Create | `src/components/providers/theme.provider.tsx` |
| Delete | `src/components/providers.tsx`                |
| Delete | `src/components/theme.provider.tsx`           |
| Modify | `src/app/[locale]/layout.tsx`                 |
| Create | `src/app/[locale]/_components/home-page.tsx`  |
| Modify | `src/app/[locale]/page.tsx`                   |
| Create | `src/hooks/.gitkeep`                          |

---

## Task 1: Reorganise `lib/` into subdirectories

Move the three API clients into their own subdirectories. Also update the one file outside `lib/` that imports `graphql.client` so that typecheck passes at the end of this task.

**Files:**

- Create: `src/lib/auth/client.ts`
- Create: `src/lib/graphql/client.ts`
- Create: `src/lib/rest/client.ts`
- Modify: `src/components/providers.tsx` (update `@/lib/graphql.client` import)
- Delete: `src/lib/auth.client.ts`, `src/lib/graphql.client.ts`, `src/lib/rest.client.ts`

- [ ] **Step 1: Create `src/lib/auth/client.ts`**

```ts
import { createAuthClient } from "better-auth/react"
import { Env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: Env.NEXT_PUBLIC_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
```

- [ ] **Step 2: Create `src/lib/graphql/client.ts`**

```ts
import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql"
import { createClient as createWSClient } from "graphql-ws"
import { Env } from "@/lib/env"

const wsClient =
  typeof window === "undefined"
    ? null
    : createWSClient({
        url: Env.NEXT_PUBLIC_GRAPHQL_WS_URL,
        connectionParams: () => ({}),
        on: {
          error: (err) =>
            console.error("[graphql-ws] subscription socket error", err),
          closed: (event) =>
            console.warn("[graphql-ws] subscription socket closed", event),
        },
      })

export const graphqlClient = new Client({
  url: Env.NEXT_PUBLIC_GRAPHQL_URL,
  fetchOptions: { credentials: "include" },
  exchanges: [
    cacheExchange,
    fetchExchange,
    ...(wsClient
      ? [
          subscriptionExchange({
            forwardSubscription(request) {
              const input = { ...request, query: request.query ?? "" }
              return {
                subscribe(sink) {
                  const unsubscribe = wsClient.subscribe(input, sink)
                  return { unsubscribe }
                },
              }
            },
          }),
        ]
      : []),
  ],
})
```

- [ ] **Step 3: Create `src/lib/rest/client.ts`**

Note: the import path for generated types changes to relative `./generated/api` since both files are now inside `lib/rest/`.

```ts
import createClient from "openapi-fetch"
import type { paths } from "./generated/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_REST_URL,
  credentials: "include",
})
```

- [ ] **Step 4: Update the graphql import in `src/components/providers.tsx`**

Change line 3 from `@/lib/graphql.client` to `@/lib/graphql/client`. The full file after the change:

```tsx
"use client"

import { Provider as UrqlProvider } from "urql"
import { ThemeProvider } from "@/components/theme.provider"
import { graphqlClient } from "@/lib/graphql/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UrqlProvider value={graphqlClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </UrqlProvider>
  )
}
```

- [ ] **Step 5: Delete the three old client files**

```bash
rm src/lib/auth.client.ts src/lib/graphql.client.ts src/lib/rest.client.ts
```

- [ ] **Step 6: Run typecheck — expect zero errors**

```bash
pnpm typecheck
```

Expected: exits with code 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth/ src/lib/graphql/ src/lib/rest/client.ts src/components/providers.tsx
git rm src/lib/auth.client.ts src/lib/graphql.client.ts src/lib/rest.client.ts
git commit -m "refactor: reorganise lib/ clients into subdirectories"
```

---

## Task 2: Extract `components/providers/`

Move `providers.tsx` and `theme.provider.tsx` into a `providers/` subdirectory. Update the one import in `layout.tsx` that references the old path.

**Files:**

- Create: `src/components/providers/theme.provider.tsx`
- Create: `src/components/providers/providers.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Delete: `src/components/providers.tsx`, `src/components/theme.provider.tsx`

- [ ] **Step 1: Create `src/components/providers/theme.provider.tsx`**

Exact copy of the existing `src/components/theme.provider.tsx` — no content changes:

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return
      }

      if (event.key !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
```

- [ ] **Step 2: Create `src/components/providers/providers.tsx`**

The `ThemeProvider` import changes to relative `./theme.provider` since both files are now in the same directory:

```tsx
"use client"

import { Provider as UrqlProvider } from "urql"
import { ThemeProvider } from "./theme.provider"
import { graphqlClient } from "@/lib/graphql/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UrqlProvider value={graphqlClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </UrqlProvider>
  )
}
```

- [ ] **Step 3: Update the providers import in `src/app/[locale]/layout.tsx`**

Change the import on line 7 from `@/components/providers` to `@/components/providers/providers`. The full file after the change:

```tsx
import { hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Roboto } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import "@/styles/globals.css"
import { Providers } from "@/components/providers/providers"
import { cn } from "@/components/ui/cn"
import { routing } from "@/i18n/i18n-routing"

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

- [ ] **Step 4: Delete the old provider files**

```bash
rm src/components/providers.tsx src/components/theme.provider.tsx
```

- [ ] **Step 5: Run typecheck — expect zero errors**

```bash
pnpm typecheck
```

Expected: exits with code 0, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/providers/ src/app/[locale]/layout.tsx
git rm src/components/providers.tsx src/components/theme.provider.tsx
git commit -m "refactor: move providers into components/providers/ subdirectory"
```

---

## Task 3: Extract home page to `_components/`

Extract the home page content from `page.tsx` into `_components/home-page.tsx` and make `page.tsx` a thin shell.

**Files:**

- Create: `src/app/[locale]/_components/home-page.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Create `src/app/[locale]/_components/home-page.tsx`**

This receives the content currently inline in `page.tsx`. Named export, not default:

```tsx
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function HomePage() {
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

- [ ] **Step 2: Replace `src/app/[locale]/page.tsx` with a thin shell**

```tsx
import { HomePage } from "./_components/home-page"

export default function Page() {
  return <HomePage />
}
```

- [ ] **Step 3: Run typecheck — expect zero errors**

```bash
pnpm typecheck
```

Expected: exits with code 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/_components/home-page.tsx src/app/[locale]/page.tsx
git commit -m "refactor: extract home page content to _components/home-page"
```

---

## Task 4: Create `hooks/` and final verification

Create the shared hooks directory and run the full verification suite.

**Files:**

- Create: `src/hooks/.gitkeep`

- [ ] **Step 1: Create `src/hooks/.gitkeep`**

```bash
mkdir src/hooks && touch src/hooks/.gitkeep
```

- [ ] **Step 2: Run the full verification suite**

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Expected:

- `typecheck`: exits 0, no errors
- `lint`: exits 0, no warnings
- `test`: exits 0, all tests pass (or "no test files found" — both are acceptable)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/.gitkeep
git commit -m "refactor: create shared hooks/ directory"
```

---

## Done

The `src/` tree now matches the target structure from the spec. All logic is unchanged — this was a pure file reorganisation.
