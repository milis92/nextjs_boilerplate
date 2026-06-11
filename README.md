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
- **Code quality** — ESLint, Prettier, knip (dead-code detection), lefthook git hooks
- **Security headers** — strict nonce-based CSP minted per-request in `src/proxy.ts`; HSTS, X-Frame-Options, Referrer-Policy and friends in `next.config.ts`

---

## Tech Stack

| Layer          | Tech                                       |
| -------------- | ------------------------------------------ |
| Framework      | Next.js 16 (App Router) + React 19         |
| Language       | TypeScript 5.9                             |
| Styling        | Tailwind CSS 4 + shadcn/ui + Radix UI      |
| GraphQL        | urql + graphql-ws + GraphQL Code Generator |
| Auth           | better-auth                                |
| i18n           | next-intl                                  |
| Env validation | @t3-oss/env-nextjs + Zod                   |
| Unit tests     | Vitest + vitest-browser-react              |
| E2E tests      | Playwright                                 |
| Code quality   | ESLint + Prettier + knip + lefthook        |

---

## Quick Start

**Prerequisites:** Node.js 24.16+, pnpm 11.2+, a running backend at `http://localhost:3001`.

```sh
git clone <repo-url>
cd nextjs-boilerplate
pnpm install
pnpm prepare              # install git hooks (not automatic — ignore-scripts=true)
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
  styles/           # Global CSS
  app.config.ts     # App-wide configuration (name, supported locales)
tests/              # Playwright e2e tests
```

> `src/lib/graphql/generated/` and `src/lib/rest/generated/` are gitignored generated output — run `pnpm graphql:generate` and `pnpm rest:generate` before typechecking on a fresh clone.

---

## Configuration

Copy `.env.example` to `.env.local` and set the variables below. All are validated at startup — missing required values will abort the build.

| Variable                     | Required | Default | Description                                                                                            |
| ---------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_REST_URL`       | Yes      | —       | Base URL of the backend REST API.                                                                      |
| `NEXT_PUBLIC_GRAPHQL_URL`    | Yes      | —       | HTTP URL for GraphQL queries and mutations.                                                            |
| `NEXT_PUBLIC_GRAPHQL_WS_URL` | Yes      | —       | WebSocket URL for GraphQL subscriptions (`ws://` in dev, `wss://` in production).                      |
| `NEXT_PUBLIC_AUTH_URL`       | Yes      | —       | Base URL of the auth server.                                                                           |
| `NEXT_PUBLIC_APP_NAME`       | Yes      | —       | Application name used in metadata and translations.                                                    |
| `NEXT_PUBLIC_APP_URL`        | Yes      | —       | Public URL of this app (`http://localhost:3000` in local dev). Used for metadata, sitemap, and robots. |

### Cookie auth & CSRF contract

API calls authenticate with the backend session cookie (`credentials: "include"`) and send **no CSRF token** — CSRF protection is delegated entirely to the backend, which must validate the `Origin` header on state-changing requests (the NestJS boilerplate does). If you deploy a derived project with the frontend and API on different origins, verify the backend's Origin validation covers your frontend origin **before** going live — without it, every mutation is CSRF-able. The same applies to GraphQL subscriptions: cross-origin WebSocket upgrades only carry cookies that are `SameSite=None; Secure` (see `src/lib/graphql/client.ts`).

### CSP strategy: strict nonce vs. static rendering (decision record)

The default is a **strict, per-request nonce CSP** (`script-src 'nonce-…' 'strict-dynamic'`, minted in `src/proxy.ts`). The unavoidable cost: **every page renders dynamically** — no SSG/ISR/PPR and no CDN caching of HTML, because nonces must be fresh per request and the layout reads them via `headers()`. This is the right default here since pages are client-fetched shells and cheap to SSR.

For a derived project that needs static/cacheable HTML (marketing or content sites), switch to the documented alternative: delete the nonce logic from `src/proxy.ts` and the `headers()` read in `src/app/[locale]/layout.tsx`, set a static CSP header in `next.config.ts` with `script-src 'self' 'unsafe-inline'`, and re-add `generateStaticParams` to the locale layout. That trades inline-script XSS protection for static rendering — see the "Without Nonces" section of the Next.js CSP guide.

These are the only two supported options (verified June 2026 on Next 16.2): the experimental `experimental.sri` hash-based approach does **not** work — SRI only covers external script files, while App Router's flight/hydration payloads and next-themes' anti-FOUC script are _inline_ and get blocked under `script-src 'self'`, silently breaking hydration. See branch `spike/sri-csp` for the experiment.

---

## Scripts

| Command                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `pnpm dev`              | Start dev server with Turbopack                        |
| `pnpm build`            | Production build                                       |
| `pnpm start`            | Start production server                                |
| `pnpm typecheck`        | TypeScript type check (no emit)                        |
| `pnpm lint`             | ESLint                                                 |
| `pnpm format`           | Prettier (writes in place)                             |
| `pnpm graphql:generate` | Generate GraphQL types from the running backend schema |
| `pnpm rest:generate`    | Generate REST client types from the OpenAPI schema     |
| `pnpm test`             | Vitest unit/component tests (CI mode)                  |
| `pnpm test:watch`       | Vitest in watch mode                                   |
| `pnpm test:e2e`         | Playwright e2e tests                                   |
| `pnpm check:deps`       | knip — detect unused exports and dependencies          |

---

## Development Workflows

### GraphQL

Write queries and mutations directly in `.ts`/`.tsx` files using the generated `graphql()` helper. Run the generator to produce fully-typed documents:

```sh
pnpm graphql:generate        # one-shot against the running backend
```

Generated files land in `src/lib/graphql/generated/` — they are gitignored, do not edit them by hand. Run `pnpm rest:generate` to regenerate the REST client types (`src/lib/rest/generated/`) on a fresh clone.

### Adding a locale or translation key

1. Add the new key to `src/i18n/locales/en.json` (and any other locale files).
2. Run `pnpm typecheck` — `src/i18n/next-intl.d.ts` provides the type augmentation that makes `useTranslations` key-safe.
3. Use the key in a component via `const t = useTranslations('Namespace')`.

To add a new locale: add the locale code to `AppConfig.i18n.locales` in `src/app.config.ts`, create `src/i18n/locales/<code>.json`, and add a translation file.

---

## Testing

**Unit / component tests** use Vitest with browser rendering via Playwright:

```sh
pnpm test          # run once
pnpm test:watch    # interactive watch mode
```

**End-to-end tests** use Playwright and live in `tests/`:

```sh
pnpm test:e2e
```

Configure Playwright targets in `playwright.config.ts`.

---

## Git Hooks

Lefthook runs automatically on `git commit`:

1. **Prettier** on staged files (auto-formats and re-stages)
2. **ESLint** on staged `.ts`/`.tsx` files (auto-fixes and re-stages)

And on `git push`:

1. **TypeScript** type check across the whole project
2. **knip** dead-code check

To install the hooks after a fresh clone, run `pnpm prepare`. This does NOT happen automatically: `.npmrc` sets `ignore-scripts=true` (supply-chain hardening), which also disables the project's own `prepare` lifecycle script.
