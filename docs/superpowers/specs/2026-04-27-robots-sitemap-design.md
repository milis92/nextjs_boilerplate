# Robots & Sitemap Setup

**Date:** 2026-04-27
**Scope:** Add `robots.ts` and `sitemap.ts` to satisfy Next.js App Router metadata conventions. Inspired by [Next.js Boilerplate](https://github.com/ixartz/Next-js-Boilerplate). `global-error.tsx` is out of scope (already implemented, no Sentry).

---

## Files Changed

### `src/app/robots.ts` (new)

Implements `MetadataRoute.Robots` using `Env.NEXT_PUBLIC_APP_URL`:

- Rules: `userAgent: "*"`, `allow: "/"`
- `sitemap`: `${Env.NEXT_PUBLIC_APP_URL}/sitemap.xml` — omitted when `APP_URL` is undefined
- Must satisfy the existing test in `src/app/robots.test.ts` without any changes to the test

### `src/app/sitemap.ts` (new)

Implements `MetadataRoute.Sitemap` with i18n alternates (Option B):

- `PUBLIC_ROUTES` string array at the top of the file (route paths relative to locale root, e.g. `""` for `/`, `"/about"` for `/about`)
- Comment on `PUBLIC_ROUTES`: add all public-facing routes here when new pages are created
- If `Env.NEXT_PUBLIC_APP_URL` is not set, return `[]` (graceful no-op in local dev)
- Each route maps to a sitemap entry:
  - `url`: `${baseUrl}${route}`
  - `lastModified`: `new Date()`
  - `alternates.languages`: object keyed by non-default locale codes, values are `${baseUrl}/${locale}${route}` (e.g. `de` → `${baseUrl}/de${route}`)
- Uses `routing` from `@/i18n/i18n-routing` for locale list and default locale
- Initial `PUBLIC_ROUTES` value: `[""]` (home only)

### `src/app/global-error.tsx` (no change)

Existing custom implementation is kept as-is. Sentry integration is deferred.

---

## Data Flow

```
Env.NEXT_PUBLIC_APP_URL
  └─ robots.ts     → /robots.txt       (allow all, link to sitemap)
  └─ sitemap.ts    → /sitemap.xml      (public routes × locales)

routing (i18n-routing.ts)
  └─ sitemap.ts    → alternates.languages per route entry
```

---

## Testing

- `robots.test.ts` already covers the robots output; `robots.ts` must pass it without modification.
- No test file is planned for `sitemap.ts` (static output, deterministic from env + route list).
