# nextjs_boilerplate — Frontend

Next.js 16 App Router frontend boilerplate. Ships with internationalization,
GraphQL subscriptions, authentication, and a shadcn/ui component baseline.

## Stack

- **Next.js 16** (App Router, React 19, React Compiler in production)
- **next-intl** for i18n (en, de) with cookie-based locale resolution
- **urql + graphql-ws** for GraphQL queries, mutations, and subscriptions
- **better-auth** for authentication
- **@t3-oss/env-nextjs + zod** for typed, validated environment variables
- **shadcn/ui + Tailwind CSS v4**
- **Vitest** (unit + browser) and **Playwright** (e2e) for testing
- **Knip** for dead-code detection, **Lefthook** for pre-commit hooks

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
pnpm dev                     # http://localhost:3000
```

The backend must be reachable at `NEXT_PUBLIC_API_URL`. REST/Auth, GraphQL,
and WebSocket subscriptions are all derived from that base URL — see
`.env.example` and `lib/graphql-client.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start the built app |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier write |
| `pnpm test` | Vitest unit + browser tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm codegen` | Generate typed GraphQL client into `lib/gql/` |
| `pnpm check:deps` | Knip dead-code check |

## Project layout

```
app/          Next.js routes, layout, global client providers
components/   UI primitives (components/ui is shadcn-managed)
lib/          Env, GraphQL client, auth client, i18n config
utils/        Pure helpers (cn, app-config)
locales/      next-intl message catalogs (en.json, de.json)
types/        Ambient module augmentations (next-intl, CSS)
tests/        Playwright e2e specs
```

## Internationalization

Locales live in `locales/*.json`. The active locale is resolved from the
`NEXT_LOCALE` cookie (`lib/i18n.ts`) and can be changed via the `setLocale`
server action (`lib/i18n-actions.ts`). Supported locales and the default are
declared in `utils/app-config.ts`.

## Hotkeys

Press **`d`** anywhere outside an input field to toggle dark mode. The handler
ignores modifier combinations and typing targets; see
`components/theme-provider.tsx`.

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

Generated files land under `components/ui/`. That directory is managed by the
shadcn CLI — avoid hand-edits.
