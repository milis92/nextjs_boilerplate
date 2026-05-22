# Architecture

Place every file in exactly one layer below — routing, features, or shared utilities never mix.

## Directory Structure

```
src/
├── app/                                       # Next.js App Router root
│   └── [locale]/                              # All pages are locale-wrapped
│       ├── layout.tsx                         # Root layout
│       ├── page.tsx                           # Root page (non-domain)
│       └── (feature)/                         # Route group per backend domain — invisible in URL
│           ├── layout.tsx                     # Feature shell layout (optional)
│           ├── _components/                   # Shared within this feature — never a route
│           │   └── <feature>-page.tsx
│           ├── _hooks/                        # Shared within this feature — never a route
│           │   └── use-<feature>.ts
│           ├── _actions/                      # Server actions for this feature — never a route
│           │   └── <feature>.actions.ts
│           └── <route>/
│               ├── page.tsx                   # Thin entry point
│               ├── _components/               # Private to this route
│               ├── _hooks/                    # Private to this route
│               └── _actions/                  # Private to this route
├── actions/                                   # Server actions shared across 2+ route groups
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
│       ├── client.ts                          # urql GraphQL client
│       └── generated/                         # Generated from GraphQL schema — do not edit
├── i18n/                                      # next-intl config and locale messages
├── styles/
├── app.config.ts                              # App-level config (name, i18n locales)
└── middleware.ts
```

!IMPORTANT Never create folders inside `app/` without the `_` prefix unless they are route segments — they will become routes.

## Naming

- Name route groups after the matching NestJS backend module in lowercase, e.g. `(auth)`, `(billing)`.
- Name the root page component `<Feature>Page` and place it in `_components/<feature>-page.tsx`, e.g. `AuthLoginPage` in `auth-login-page.tsx`.
