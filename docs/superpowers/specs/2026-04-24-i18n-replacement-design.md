# i18n Replacement Design

**Date:** 2026-04-24
**Reference:** https://github.com/ixartz/Next-js-Boilerplate

## Goal

Replace the current cookie-based internationalisation setup with the URL-based approach used in the Next.js Boilerplate, adapted to exclude Crowdin and to use our existing `en`/`de` locales.

## What Changes

### Architecture: custom cookie-based → URL-primary routing

The current setup stores the active locale in a `NEXT_LOCALE` cookie and reads it via a custom `getRequestConfig`. The new setup uses URL-primary routing: the locale is encoded in the URL with a `[locale]` dynamic segment and `localePrefix: 'as-needed'` (default locale has no prefix). next-intl middleware still reads and writes a `NEXT_LOCALE` cookie as a secondary hint (this matches the boilerplate; see the `localeCookie` note below), but the URL prefix always takes precedence.

| Behaviour | Before | After |
|-----------|--------|-------|
| Primary locale source | Cookie (`NEXT_LOCALE`) | URL segment |
| English URL | `/` | `/` |
| German URL | `/` (cookie distinguishes) | `/de` |
| Locale detection | Manual cookie read in `getRequestConfig` | next-intl middleware (URL → cookie hint → Accept-Language → default) |
| Locale switching | Server action writes cookie | Navigate to locale-prefixed URL |

### File structure

**Deleted:**
- `src/lib/i18n.ts`
- `src/lib/i18n-actions.ts`
- `src/locales/en.json`
- `src/locales/de.json`

**Created:**
```
src/i18n/
├── locales/
│   ├── en.json           # moved from src/locales/en.json
│   └── de.json           # moved from src/locales/de.json
├── I18n.ts               # getRequestConfig — reads requestLocale from URL
├── I18nRouting.ts        # defineRouting — locales, defaultLocale, localePrefix
└── I18nNavigation.ts     # createNavigation — locale-aware Link, usePathname, useRouter

src/proxy.ts               # new — next-intl middleware for locale detection/redirect (Next 16 uses proxy.ts, not middleware.ts)
src/app/[locale]/
├── layout.tsx            # moved from src/app/layout.tsx
└── page.tsx              # moved from src/app/page.tsx
```

**Renamed:**
- `src/types/i18n.ts` → `src/types/I18n.ts` — update import paths to point at `src/i18n/`; augmentation pattern stays the same (`declare module "next-intl" { interface AppConfig }`)

**Modified:**
- `src/utils/app-config.ts` — remove `cookieName` and the `isLocale` helper (no remaining consumers after `i18n-actions.ts` is deleted); add `localePrefix: 'as-needed'`
- `next.config.ts` — update plugin path to `./src/i18n/I18n.ts`
- `knip.config.ts` — four precise changes to the `ignore` list: (1) replace `src/lib/i18n.ts` with `src/i18n/I18n.ts` (file moves); (2) remove `src/lib/i18n-actions.ts` entirely (file is deleted, no replacement); (3) rename `src/types/i18n.ts` to `src/types/I18n.ts` (in-place rename, does not move to `src/i18n/`); (4) add `src/i18n/I18nNavigation.ts` (no consumers yet — infrastructure for future locale-switching UI)
- `README.md` — update all stale i18n references throughout the file (cookie-based locale wording, old file locations such as `locales/*.json`, `types/i18n.ts`, and locale-addition instructions that point at the old paths)
- `tests/home.e2e.ts` — second test: remove `context` fixture parameter and `addCookies` block; replace `page.goto('/')` with `page.goto('/de')`; update test title to reflect URL-based locale switching (no trailing slash — `trailingSlash` is not enabled in `next.config.ts`)

### File contents

**`src/i18n/I18nRouting.ts`**
```ts
import { defineRouting } from 'next-intl/routing'
import { AppConfig } from '@/utils/app-config'

export const routing = defineRouting({
  locales: AppConfig.i18n.locales,
  localePrefix: AppConfig.i18n.localePrefix,
  defaultLocale: AppConfig.i18n.defaultLocale,
})
```

> **Note on `localeCookie`:** next-intl middleware defaults to both reading and writing a `NEXT_LOCALE` cookie (`localeCookie` defaults to `true`). The cookie is read before `Accept-Language` during locale resolution and written/synced on navigation. The boilerplate does not disable this, so we match it. To disable all cookie-based locale behaviour (reads and writes), add `localeCookie: false` to the `defineRouting` call.

**`src/i18n/I18nNavigation.ts`**
```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './I18nRouting'

export const { Link, usePathname, useRouter } = createNavigation(routing)
```

**`src/i18n/I18n.ts`**
```ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './I18nRouting'

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

**`src/proxy.ts`**
```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/I18nRouting'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
```

> **Note:** Next.js 16 renamed the Middleware file convention from `middleware.ts` to `proxy.ts`. The import from `next-intl/middleware` is unchanged — that is a library export path, not a file name.

**`src/types/I18n.ts`** (renamed from `i18n.ts`; augmentation pattern unchanged, only import paths updated)
```ts
import type messages from '@/i18n/locales/en.json'
import type { Locale } from '@/utils/app-config'

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
```

**`src/utils/app-config.ts`** (diff)
```ts
// Remove:
cookieName: 'NEXT_LOCALE'

// Add:
localePrefix: 'as-needed' as const
```

**`src/app/[locale]/layout.tsx`**

Replaces `src/app/layout.tsx` entirely (the old root layout is deleted). In Next.js App Router, `app/[locale]/layout.tsx` at the top of the app directory serves as the effective root layout when all routes are under the `[locale]` segment. Changes from the current layout:
- receives `params: Promise<{ locale: string }>` prop
- adds `generateStaticParams()` to pre-render all locales at build time
- validates locale with `hasLocale`; calls `notFound()` if invalid
- calls `setRequestLocale(locale)` after validation (required for static rendering; must receive the narrowed locale type)
- replaces `getLocale()` call with the locale received from params; `getMessages()` and `NextIntlClientProvider` remain unchanged
- updates `globals.css` import from `./globals.css` to `../globals.css` (file is now one directory deeper)

**`src/app/[locale]/page.tsx`**

Content unchanged — file moves from `src/app/page.tsx` to `src/app/[locale]/page.tsx`.

## What Does Not Change

- `next-intl` package version (4.9.1 — already correct)
- Translation file content (`en.json`, `de.json`)
- Translation usage in components (`useTranslations`, `getTranslations`, `t.rich`)
- `NextIntlClientProvider` usage in the layout (still receives `locale` and `messages`; only the source of `locale` changes)
- `AppConfig.i18n.locales` and `AppConfig.i18n.defaultLocale` values

## Out of Scope

- Crowdin integration (explicitly excluded)
- `@lingual/i18n-check` validation tooling (can be added separately if desired)
- Locale switcher UI component (not currently present; not added)
