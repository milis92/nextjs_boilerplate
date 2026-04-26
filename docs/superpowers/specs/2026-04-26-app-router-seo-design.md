---
title: App Router Special Files + Public SEO Surface
date: 2026-04-26
status: approved
---

## Overview

Two independent gaps in the Next.js boilerplate:

1. **App Router special files** — `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`
2. **Public SEO surface** — base metadata, hreflang alternates, sitemap, robots, OG image

No new npm packages required. Everything uses built-in Next.js primitives.

---

## Gap 1 — App Router Special Files

### Files

All under `src/app/[locale]/` unless noted.

#### `loading.tsx`

Simple Suspense fallback shown while the page segment is streaming.  
A centred spinner div — intentionally minimal so projects replace it.  
No i18n needed.

#### `error.tsx`

Client component (`"use client"`). Receives `{ error, reset }` props from Next.js.  
- Uses `useTranslations("Error")` for heading, message, and button copy.  
- Calls `reset()` on button click.  
- Logs the error to `console.error` in development.

#### `not-found.tsx`

Rendered when `notFound()` is called or a route has no match.  
- Uses `useTranslations("NotFound")` for heading and message.  
- Includes a localised back-to-home `<Link>` via `@/i18n/i18n-navigation`.

#### `global-error.tsx` (at `src/app/global-error.tsx`)

Catches errors thrown inside the root layout itself, where no providers are available.  
- Must render its own `<html><body>` wrapper.  
- **Cannot use next-intl** — hardcoded English strings only. This is acceptable and documented inline.  
- Same reset-button pattern as `error.tsx`.

### Translation keys

Add to both `src/i18n/locales/en.json` and `de.json`:

```json
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
```

German equivalents added to `de.json`.

---

## Gap 2 — Public SEO Surface

### Locale prefix convention

`AppConfig.i18n.localePrefix` is `"as-needed"`: English lives at `/`, German at `/de`.  
All canonical/alternate URLs use `NEXT_PUBLIC_APP_URL` as the base. When `APP_URL` is unset (local dev), metadata is still generated without absolute URLs — Next.js handles this gracefully.

### Files

#### `src/app/[locale]/layout.tsx` — `generateMetadata` export

Added alongside the existing default export. Produces:

- `title`: `{ default: AppName, template: "%s | AppName" }`
- `description`: placeholder string (`"Your app description"`) — projects override per page
- `applicationName`: from `NEXT_PUBLIC_APP_NAME`
- `metadataBase`: `new URL(NEXT_PUBLIC_APP_URL)` when set, `undefined` otherwise
- `openGraph`: `{ type: "website", siteName, title, description }`
- `twitter`: `{ card: "summary_large_image" }`
- `alternates.languages`: hreflang map over `AppConfig.i18n.locales`, respecting `as-needed` prefix (en → `/`, de → `/de`)

#### `src/app/[locale]/page.tsx` — `generateMetadata` export

Home-page-specific metadata:

- `title`: overrides to just `AppName` (no template suffix on the landing page)
- `alternates.canonical`: absolute URL for the current locale's home route

#### `src/app/sitemap.ts`

Returns `MetadataRoute.Sitemap`. For the boilerplate there is one static route (home). Projects extend this array.

Each route produces one entry per locale:

```
{ url: baseUrl + localePrefix + route, lastModified: new Date(), alternates: { languages: { en: ..., de: ... } } }
```

Exports as `dynamic = "force-static"` to avoid being blocked by missing env vars at build time.

Falls back to an empty array when `NEXT_PUBLIC_APP_URL` is unset (safe for local dev).

#### `src/app/robots.ts`

Returns `MetadataRoute.Robots`:

```
{ rules: { userAgent: '*', allow: '/' }, sitemap: baseUrl + '/sitemap.xml' }
```

`sitemap` field is omitted when `APP_URL` is unset.

#### `src/app/[locale]/opengraph-image.tsx`

Dynamic OG image via `next/og` `ImageResponse` (1200×630).  
Renders the app name in large text on a dark background.  
Uses `NEXT_PUBLIC_APP_NAME` from env — no locale-specific logic needed at this level.  
Placed inside `[locale]/` (not the app root) because there is no `src/app/layout.tsx` — the locale layout is the effective root, and Next.js only inherits OG images from the nearest enclosing layout segment. Individual pages can override by co-locating their own `opengraph-image.tsx`.

### `.env.example` note

`NEXT_PUBLIC_APP_URL` already has a comment noting it should be set in production. No change needed.

---

## Constraints

- `global-error.tsx` intentionally skips i18n — providers are unavailable at that error boundary level.
- `sitemap.ts` and `robots.ts` silently degrade when `APP_URL` is unset, so local dev does not require the variable.
- `generateMetadata` in `layout.tsx` uses async params (`Promise<{ locale: string }>`) consistent with the existing layout signature.
- Description placeholder (`"Your app description"`) is intentional — every project has a different description; the boilerplate documents the pattern, not the content.
