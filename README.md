<div align="center">

# Next.js Boilerplate

Production-ready Next.js starter with GraphQL, auth, i18n, and full testing tooling pre-wired — skip the setup, start building.

[Quick Start](#quick-start) · [Configuration](#configuration) · [Scripts](#scripts)

</div>

---

## Highlights

- **Next.js 16 App Router** with Turbopack and React 19
- **GraphQL out of the box** — urql client with subscriptions (WebSocket) and code generation
- **Authentication** via better-auth, connected to the backend at boot
- **Internationalisation** — next-intl with URL-primary locale routing (en + de); English at `/`, German at `/de`
- **Type-safe environment variables** validated at build time via @t3-oss/env-nextjs + Zod
- **UI components** — Tailwind CSS 4, shadcn/ui, Radix UI
- **Testing** — Vitest (unit/component) + Playwright (e2e), both zero-config
- **Code quality** — ESLint, Prettier, knip (dead-code detection), lefthook pre-commit hooks
- **Security headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy baked into `next.config.ts`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| GraphQL | urql + graphql-ws + GraphQL Code Generator |
| Auth | better-auth |
| i18n | next-intl |
| Env validation | @t3-oss/env-nextjs + Zod |
| Unit tests | Vitest + vitest-browser-react |
| E2E tests | Playwright |
| Code quality | ESLint + Prettier + knip + lefthook |

---

## Quick Start

**Prerequisites:** Node.js 20+, pnpm 9+, a running backend at `http://localhost:3001`.

```sh
git clone <repo-url>
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the "Project ready!" page.

---

## Project Structure

```
src/
  app/              # Next.js App Router — pages, layouts, providers
  components/       # Shared UI components (shadcn/ui based)
  lib/              # Core wiring: auth client, GraphQL client, env
  i18n/             # Internationalisation — routing config, request config, navigation helpers
    locales/        # Translation message files (en.json, de.json)
  types/            # Global TypeScript declarations
  utils/            # App config and utility helpers
tests/              # Playwright e2e tests
```

> `src/lib/gql/` and `src/lib/rest/` are generated at runtime and gitignored — run the relevant codegen scripts before typechecking on a fresh clone.

---

## Configuration

Copy `.env.example` to `.env.local` and set the variables below. All are validated at startup — missing required values will abort the build.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_REST_URL` | Yes | — | Base URL of the backend REST API. |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes | — | HTTP URL for GraphQL queries and mutations. |
| `NEXT_PUBLIC_GRAPHQL_WS_URL` | Yes | — | WebSocket URL for GraphQL subscriptions (`ws://` in dev, `wss://` in production). |
| `NEXT_PUBLIC_AUTH_URL` | Yes | — | Base URL of the auth server. |
| `NEXT_PUBLIC_APP_NAME` | Yes | — | Application name used in metadata and translations. |
| `NEXT_PUBLIC_APP_URL` | No | — | Public URL of this app. Leave unset in local dev; set in production deployments. |

---

## Scripts

| Command              | Description                                            |
|----------------------|--------------------------------------------------------|
| `pnpm dev`           | Start dev server with Turbopack                        |
| `pnpm build`         | Production build                                       |
| `pnpm start`         | Start production server                                |
| `pnpm typecheck`     | TypeScript type check (no emit)                        |
| `pnpm lint`          | ESLint                                                 |
| `pnpm format`        | Prettier (writes in place)                             |
| `pnpm codegen`       | Generate GraphQL types from the running backend schema |
| `pnpm codegen:watch` | Watch mode for GraphQL codegen                         |
| `pnpm test`          | Vitest unit/component tests (CI mode)                  |
| `pnpm test:watch`    | Vitest in watch mode                                   |
| `pnpm test:e2e`      | Playwright e2e tests                                   |
| `pnpm check:deps`    | knip — detect unused exports and dependencies          |

---

## Development Workflows

### GraphQL

Write queries and mutations directly in `.ts`/`.tsx` files using the `graphql()` helper from `@/lib/gql`. Run codegen to generate fully-typed hooks and documents:

```sh
pnpm codegen        # one-shot against the running backend
pnpm codegen:watch  # re-runs on file save
```

Generated files land in `src/lib/gql/` — they are gitignored, do not edit them by hand. Run `pnpm codegen:rest` to regenerate the REST client types (`src/lib/rest/`) on a fresh clone.

### Adding a locale or translation key

1. Add the new key to `src/i18n/locales/en.json` (and any other locale files).
2. Run `pnpm typecheck` — `src/types/I18n.ts` provides the type augmentation that makes `useTranslations` key-safe.
3. Use the key in a component via `const t = useTranslations('Namespace')`.

To add a new locale: add the locale code to `AppConfig.i18n.locales` in `src/utils/app-config.ts`, create `src/i18n/locales/<code>.json`, and add a translation file.

---

## Testing

**Unit / component tests** use Vitest with browser rendering via Playwright:

```sh
pnpm test          # run once (passes with no tests)
pnpm test:watch    # interactive watch mode
```

**End-to-end tests** use Playwright and live in `tests/`:

```sh
pnpm test:e2e
```

Configure Playwright targets in `playwright.config.ts`.

---

## Pre-commit Hooks

Lefthook runs automatically on `git commit`:

1. **ESLint** on staged `.ts`/`.tsx` files (auto-fixes and re-stages)
2. **TypeScript** type check across the whole project
3. **knip** dead-code check

To install the hooks after a fresh clone: `pnpm prepare` (runs automatically after `pnpm install`).
