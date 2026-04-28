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
│       ├── _module/                           # Private support code — never a route
│       │   ├── components/
│       │   │   └── <feature>-page.tsx
│       │   ├── hooks/
│       │   │   └── use-<feature>.ts
│       │   └── actions/
│       │       └── <feature>.actions.ts
│       └── <route>/
│           └── page.tsx                       # Thin entry point
├── components/                                # Shared across 2+ features
│   └── ui/                                    # shadcn/ui primitives — do not edit
├── hooks/                                     # Hooks shared across 2+ features
├── lib/                                       # See src/lib rules if present
├── i18n/                                      # See src/i18n rules if present
├── styles/
└── middleware.ts
```

## Naming

- Route group: lowercase domain name matching the NestJS backend module, e.g. `(auth)`, `(billing)`
- Root page component: `<Feature>Page` in `<feature>-page.tsx`, e.g. `AuthLoginPage` in `auth-login-page.tsx`
- Test file: co-located with the file under test, `.test.ts(x)` suffix
- Locale message namespace: PascalCase matching the feature, e.g. `"AuthLogin"`

## Cross-feature dependencies

- Code used by 2 or more features moves to `src/components/` or `src/hooks/`
- Pages that do not belong to a backend domain (e.g. home, error, catch-all) live directly under `app/[locale]/` without a route group

## Anti-patterns

- NEVER create folders inside `app/` without the `_` prefix unless they are route segments — they will become routes
- NEVER create user-facing pages outside `app/[locale]/` — all pages must be locale-wrapped
- NEVER create a top-level `src/features/` directory — feature code lives inside `app/[locale]/`
- NEVER omit `"use client"` on `error.tsx` — Next.js requires it for error boundaries
