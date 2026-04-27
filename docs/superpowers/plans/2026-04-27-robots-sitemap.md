# Robots & Sitemap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `robots.ts` and `sitemap.ts` to the Next.js App Router so the app serves `/robots.txt` and `/sitemap.xml` with proper i18n alternates.

**Architecture:** Two new root-level App Router files. `robots.ts` reads `Env.NEXT_PUBLIC_APP_URL` to conditionally include the sitemap link. `sitemap.ts` maintains a `PUBLIC_ROUTES` array at the top of the file and uses `routing` from `@/i18n/i18n-routing` to generate locale alternates for each route.

**Tech Stack:** Next.js App Router metadata API (`MetadataRoute`), `@/lib/env` (`Env`), `next-intl` routing, Vitest

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/app/robots.ts` | Serve `/robots.txt` — allow all agents, link to sitemap |
| Create | `src/app/sitemap.ts` | Serve `/sitemap.xml` — public routes with i18n alternates |
| Exists | `src/app/robots.test.ts` | Already written — must pass without modification |

---

### Task 1: Implement `robots.ts`

**Files:**
- Create: `src/app/robots.ts`
- Test: `src/app/robots.test.ts` (already written — do not modify)

- [ ] **Step 1: Run the existing test to confirm it currently fails**

```bash
npm test -- src/app/robots.test.ts
```

Expected: FAIL — `Cannot find module './robots'`

- [ ] **Step 2: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(Env.NEXT_PUBLIC_APP_URL
      ? { sitemap: `${Env.NEXT_PUBLIC_APP_URL}/sitemap.xml` }
      : {}),
  }
}
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
npm test -- src/app/robots.test.ts
```

Expected: all 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat: add robots.ts"
```

---

### Task 2: Implement `sitemap.ts`

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next"

import { Env } from "@/lib/env"
import { routing } from "@/i18n/i18n-routing"

// Add all public-facing routes here when new pages are created.
// Each entry is a path relative to the locale root:
//   ""        → /
//   "/about"  → /about
const PUBLIC_ROUTES = [""]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = Env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) return []

  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales
          .filter((locale) => locale !== routing.defaultLocale)
          .map((locale) => [locale, `${baseUrl}/${locale}${route}`])
      ),
    },
  }))
}
```

- [ ] **Step 2: Run typecheck to verify no type errors**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Run full test suite to confirm nothing regressed**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add sitemap.ts with i18n alternates"
```
