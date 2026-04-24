# i18n Replacement Design

**Date:** 2026-04-24
**Reference:** https://github.com/ixartz/Next-js-Boilerplate

## Goal

Replace the current cookie-based internationalisation setup with the URL-based approach used in the Next.js Boilerplate, adapted to exclude Crowdin and to use our existing `en`/`de` locales.

## What Changes

### Architecture: Cookie → URL routing

The current setup stores the active locale in a `NEXT_LOCALE` cookie and reads it via `getRequestConfig`. The new setup encodes the locale in the URL using a `[locale]` dynamic segment with `localePrefix: 'as-needed'` (default locale has no prefix).

| Behaviour | Before | After |
|-----------|--------|-------|
| Locale storage | Cookie (`NEXT_LOCALE`) | URL segment |
| English URL | `/` | `/` |
| German URL | `/` (cookie only) | `/de/` |
| Locale detection | Manual cookie read | next-intl middleware |
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

src/middleware.ts          # new — next-intl middleware for locale detection/redirect
src/app/[locale]/
├── layout.tsx            # moved from src/app/layout.tsx
└── page.tsx              # moved from src/app/page.tsx
```

**Renamed:**
- `src/types/i18n.ts` → `src/types/I18n.ts` — update import paths to point at `src/i18n/`; augmentation pattern stays the same (`declare module "next-intl" { interface AppConfig }`)

**Modified:**
- `src/utils/app-config.ts` — remove `cookieName`, add `localePrefix: 'as-needed'`
- `next.config.ts` — update plugin path to `./src/i18n/I18n.ts`
- `knip.config.ts` — update ignored i18n file path references (`src/lib/i18n*`, `src/types/i18n.ts`) to reflect the new `src/i18n/` location
- `tests/home.e2e.ts` — second test sets a `NEXT_LOCALE` cookie; replace with URL-based navigation (`page.goto('/de/')`) since locale is now in the URL

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

**`src/middleware.ts`**
```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/I18nRouting'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
```

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
- calls `setRequestLocale(locale)` before rendering
- validates locale with `hasLocale`; calls `notFound()` if invalid
- adds `generateStaticParams()` to pre-render all locales at build time
- swaps `getLocale()` + `getMessages()` calls for the locale received from params
- updates `globals.css` import from `./globals.css` to `../globals.css` (file is now one directory deeper)

**`src/app/[locale]/page.tsx`**

Content unchanged — file moves from `src/app/page.tsx` to `src/app/[locale]/page.tsx`.

## What Does Not Change

- `next-intl` package version (4.9.1 — already correct)
- Translation file content (`en.json`, `de.json`)
- Translation usage in components (`useTranslations`, `getTranslations`, `t.rich`)
- `NextIntlClientProvider` usage in the layout
- `AppConfig.i18n.locales` and `AppConfig.i18n.defaultLocale` values

## Out of Scope

- Crowdin integration (explicitly excluded)
- `@lingual/i18n-check` validation tooling (can be added separately if desired)
- Locale switcher UI component (not currently present; not added)
