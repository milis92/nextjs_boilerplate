---
paths:
  - "src/app/**/*"
---

## Mandatory Directory structure

```
src/
├── app/[locale]/                              # All pages are locale-wrapped
│   ├── layout.tsx                             # Root layout
│   ├── page.tsx                               # Root page (non-domain)
│   └── (feature)/                             # Route group per backend domain — invisible in URL
│       ├── layout.tsx                         # Feature shell layout (optional)
│       ├── _components/                       # Shared within this feature — never a route
│       │   └── <feature>-page.tsx
│       ├── _hooks/                            # Shared within this feature — never a route
│       │   └── use-<feature>.ts
│       ├── _actions/                          # Server actions for this feature — never a route
│       │   └── <feature>.actions.ts
│       └── <route>/
│           ├── page.tsx                       # Thin entry point
│           ├── _components/                   # Private to this route
│           ├── _hooks/                        # Private to this route
│           └── _actions/                      # Private to this route
├── components/                                # Shared across 2+ features
│   ├── ui/                                    # shadcn/ui primitives — do not edit
│   └── providers/                             # App-level React context and bootstrap
├── hooks/                                     # Hooks shared across 2+ features
├── lib/
│   ├── env.ts                                 # Environment variable validation
│   ├── auth/
│   │   └── client.ts                          # better-auth client
│   ├── rest/
│   │   ├── client.ts                          # openapi-fetch typed REST client
│   │   └── generated/api.ts                   # Generated from OpenAPI spec — do not edit
│   └── graphql/
│       └── client.ts                          # urql GraphQL client
├── i18n/                                      # next-intl config and locale messages
├── styles/
├── app.config.ts                              # App-level config (name, i18n locales)
└── middleware.ts
```

## Naming

- Route group: lowercase domain name matching the NestJS backend module, e.g. `(auth)`, `(billing)`
- Root page component: `<Feature>Page` in `<feature>-page.tsx` inside `_components/`, e.g. `AuthLoginPage` in `auth-login-page.tsx`
- Server action file: `<feature>.actions.ts`, e.g. `auth.actions.ts`
- Hook file: `use-<feature>.ts`, e.g. `use-session.ts`
- Test file: co-located with the file under test, `.test.ts(x)` suffix
- Locale message namespace: PascalCase matching the feature, e.g. `"AuthLogin"`

## Cross-feature dependencies

- Code used by 2 or more features moves to `src/components/` or `src/hooks/`
- Pages that do not belong to a backend domain (e.g. home, error, catch-all) live directly under `app/[locale]/` without a route group

### Co-location placement rule

Code lives at the **lowest common ancestor** of its consumers. There are three levels:

| Level         | Location                          | When to use                             |
| ------------- | --------------------------------- | --------------------------------------- |
| Route-private | `[route]/_components/`            | Used by exactly one route               |
| Group-shared  | `(group)/_components/`            | Used by 2+ routes within the same group |
| App-shared    | `src/components/` or `src/hooks/` | Used by 2+ route groups                 |

**Starting point:** all new code starts at route-private (Level 1).

**Escalation trigger:** a second consumer. When a second route needs the same file, move it up to the group level. When a second group needs it, move it to `src/`.

**Enforcement:** a route may import from its own `_components/`, its group's `_components/`, and `src/components/` — never from a sibling route's `_components/`. An import path of the form `../../other-route/_components/foo` is always wrong — escalate instead.

The same rule applies to `_hooks/` and `_actions/`.

## Page Shell Pattern

Every `page.tsx` is a thin routing entry point — no logic, no hooks, no data fetching. It imports one component from `_components/` and renders it. Forward `params` and `searchParams` only when the feature component actually uses them; omit them for routes that don't need them.

See `.claude/rules/features/page.md` for the full convention and examples.

## Anti-patterns

- NEVER create folders inside `app/` without the `_` prefix unless they are route segments — they will become routes
- NEVER create user-facing pages outside `app/[locale]/` — all pages must be locale-wrapped
- NEVER create a top-level `src/features/` directory — feature code lives inside `app/[locale]/`
- NEVER omit `"use client"` on `error.tsx` — Next.js requires it for error boundaries
