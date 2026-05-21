# Project Structure Design

**Date:** 2026-05-21
**Status:** Approved

## Goal

Reorganise `src/` to follow Next.js App Router best practices in a way that scales from a small team to a larger product. The structure must be simple by default and structured when needed, with clear answers to "where does new code go?" at every level.

---

## Target Directory Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                    ← root locale layout (fonts, providers, i18n)
│   │   ├── page.tsx                      ← thin shell: delegates to _components/
│   │   ├── _components/                  ← private to [locale] root
│   │   │   └── home-page.tsx
│   │   └── (feature)/                    ← route group per domain (e.g. (auth))
│   │       ├── layout.tsx                ← optional shell layout
│   │       ├── _components/              ← shared within this feature
│   │       ├── _hooks/                   ← shared within this feature
│   │       ├── _actions/                 ← server actions for this feature
│   │       └── [route]/
│   │           ├── page.tsx              ← thin shell: delegates to ../_components/
│   │           ├── _components/          ← private to this route
│   │           ├── _hooks/               ← private to this route
│   │           └── _actions/             ← private to this route
│   ├── global-error.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   └── favicon.ico
│
├── components/
│   ├── ui/                               ← shadcn primitives — never edit manually
│   └── providers/                        ← app-level React context and bootstrap
│       ├── providers.tsx
│       └── theme.provider.tsx
│
├── hooks/                                ← hooks shared across 2+ features
│
├── lib/
│   ├── env.ts                            ← environment variable validation (t3-env)
│   ├── auth/
│   │   └── client.ts                     ← better-auth client
│   ├── rest/
│   │   ├── client.ts                     ← openapi-fetch client
│   │   └── generated/
│   │       └── api.ts                    ← generated from OpenAPI spec (do not edit)
│   └── graphql/
│       └── client.ts                     ← urql client
│
├── i18n/
│   ├── i18n.ts
│   ├── i18n-routing.ts
│   ├── i18n-navigation.ts
│   ├── next-intl.d.ts
│   └── locales/
│       ├── en.json
│       └── de.json
│
├── styles/
│   └── globals.css
│
├── app.config.ts                         ← app-level config (name, i18n locales)
└── middleware.ts
```

---

## Key Conventions

### 1. Pages are thin shells

Every `page.tsx` does exactly one thing: import and render the root component from `_components/`. No logic, no hooks, no data fetching.

```tsx
// app/[locale]/(auth)/login/page.tsx
import { LoginPage } from "./_components/login-page"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function Page({ params, searchParams }: Props) {
  return <LoginPage params={await params} searchParams={await searchParams} />
}
```

Forward `params` and `searchParams` to the root component — they are always `Promise<…>` in Next.js 15+. Omit them when the route genuinely doesn't use them.

The `_` prefix excludes the folder from Next.js routing so it never becomes a URL segment.

### 2. Co-location placement rule

Code lives at the **lowest common ancestor** of its consumers. There are three levels:

| Level         | Location                          | When to use                             |
| ------------- | --------------------------------- | --------------------------------------- |
| Route-private | `[route]/_components/`            | Used by exactly one route               |
| Group-shared  | `(group)/_components/`            | Used by 2+ routes within the same group |
| App-shared    | `src/components/` or `src/hooks/` | Used by 2+ route groups                 |

**Starting point:** everything starts at Level 1 (route-private).

**Escalation trigger:** a second consumer. When a second route needs the same component, hook, or action, move it up to the group level. When a second group needs it, move it to `src/`.

**Enforcement — import direction:**

- A route may import from its own `_components/`, its group's `_components/`, and `src/components/` — nothing else.
- A route may **never** import from a sibling route's `_components/`.
- An import path of the form `../../other-route/_components/foo` is always wrong — escalate instead.

### 3. `components/` split

| Folder                  | Contents                                      | Rule                                                                                               |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `components/ui/`        | shadcn primitives                             | Never edit manually — regenerate via `shadcn` CLI                                                  |
| `components/providers/` | App-level React context and provider wrappers | Edit freely. Use `providers.tsx` as the barrel entry; import as `@/components/providers/providers` |

### 4. `lib/` is infrastructure only

`lib/` contains clients, config, and generated code — nothing feature-specific. Organised by concern:

| Path                        | Contents                                               |
| --------------------------- | ------------------------------------------------------ |
| `lib/env.ts`                | Environment variable schema and validated `Env` export |
| `lib/auth/client.ts`        | `better-auth` client instance                          |
| `lib/rest/client.ts`        | `openapi-fetch` typed REST client                      |
| `lib/rest/generated/api.ts` | Generated OpenAPI types — do not edit                  |
| `lib/graphql/client.ts`     | `urql` GraphQL client instance                         |

### 5. `hooks/` is for shared hooks only

`src/hooks/` is for custom hooks used by two or more features. A hook that is only used within one feature lives in that feature's `_hooks/` folder and does not belong here.

### 6. `_actions/` for server mutations

Server actions live in `_actions/` folders co-located with their feature, following the same placement rule as components and hooks. Every actions file starts with `"use server"`.

---

## Changes Required to Reach This Structure

### File moves

| From                                | To                                            |
| ----------------------------------- | --------------------------------------------- |
| `src/lib/auth.client.ts`            | `src/lib/auth/client.ts`                      |
| `src/lib/rest.client.ts`            | `src/lib/rest/client.ts`                      |
| `src/lib/graphql.client.ts`         | `src/lib/graphql/client.ts`                   |
| `src/components/providers.tsx`      | `src/components/providers/providers.tsx`      |
| `src/components/theme.provider.tsx` | `src/components/providers/theme.provider.tsx` |

### New files

| File                                         | Purpose                                    |
| -------------------------------------------- | ------------------------------------------ |
| `src/app/[locale]/_components/home-page.tsx` | Receives content extracted from `page.tsx` |
| `src/hooks/.gitkeep`                         | Marks the shared hooks directory           |

### File edits

| File                                     | Change                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| `src/app/[locale]/page.tsx`              | Extract content to `_components/home-page.tsx`, make thin |
| `src/app/[locale]/layout.tsx`            | Update providers import path                              |
| `src/components/providers/providers.tsx` | Update theme provider and graphql client import paths     |

### Import path updates

| Old import                    | New import                             |
| ----------------------------- | -------------------------------------- |
| `@/components/providers`      | `@/components/providers/providers`     |
| `@/components/theme.provider` | `./theme.provider` (within providers/) |
| `@/lib/auth.client`           | `@/lib/auth/client`                    |
| `@/lib/rest.client`           | `@/lib/rest/client`                    |
| `@/lib/graphql.client`        | `@/lib/graphql/client`                 |

---

## What This Does Not Change

- `src/i18n/` — already well-structured, no changes
- `src/app/global-error.tsx` — out of scope for this restructure
- `src/app/robots.ts`, `src/app/sitemap.ts` — out of scope
- `src/styles/globals.css` — unchanged
- `src/middleware.ts` — unchanged
- `src/app.config.ts` — unchanged
- `next.config.ts`, `tsconfig.json`, all tooling config — unchanged
- No logic changes anywhere — this is a pure structural reorganisation
