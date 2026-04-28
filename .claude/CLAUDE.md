# Next.js Frontend Boilerplate — Agent Guide

This is a Next.js 16.2 frontend boilerplate paired with the [NestJS boilerplate](https://github.com/milis92/nestjs-boilerplate). Read this file before writing any code.

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, Turbopack)
- **UI**: React 19, shadcn/ui, Radix UI, Tailwind CSS 4
- **Data fetching**: urql (GraphQL), openapi-fetch (REST)
- **Auth**: better-auth (client)
- **i18n**: next-intl
- **Testing**: Vitest (unit/component), Playwright (E2E)
- **Code quality**: TypeScript strict, ESLint, Prettier, lefthook (git hooks), knip (dead code)
- **Package manager**: pnpm

## Documentation

Version-matched Next.js documentation is bundled in this repo. Read it before working with Next.js APIs — it matches the exact version installed.

@node_modules/next/dist/docs/index.md

## Commands

```bash
# Dev
pnpm dev                    # Start dev server (Turbopack, http://localhost:3000)
pnpm build                  # Production build
pnpm start                  # Run production build

# Code Quality
pnpm lint                   # ESLint
pnpm format                 # Prettier (auto-fix)
pnpm typecheck              # TypeScript type check

# Testing
pnpm test                   # Vitest unit/component tests
pnpm test:watch             # Vitest in watch mode
pnpm test:e2e               # Playwright E2E tests

# Code Generation (run before consuming new endpoints)
pnpm rest:generate          # Generate REST types from OpenAPI spec → src/lib/rest/generated/api.ts
pnpm graphql:generate       # Generate GraphQL types from schema → src/lib/gql/

# Maintenance
pnpm check:deps             # Detect unused dependencies (knip)
```

## Code Generation Workflow

!IMPORTANT: Before writing any code that calls a new REST or GraphQL endpoint:

1. Ensure the NestJS backend is running (see Full-Stack Startup below)
2. Run the relevant generate command:
   - REST endpoint: `pnpm rest:generate`
   - GraphQL operation: `pnpm graphql:generate`
3. Only then write the consuming code

Never call backend APIs with raw `fetch()`. Always use the typed generated clients:

- REST: `restClient` from `@/lib/rest.client`
- GraphQL: urql hooks (`useQuery`, `useMutation`, `useSubscription`) with typed documents from `@/lib/gql`

## Full-Stack Startup

To run the complete stack locally:

```bash
# 1. Start the NestJS backend (from the nestjs-boilerplate directory)
pnpm docker:up              # Start PostgreSQL + Redis
pnpm db:migrate             # Apply migrations
pnpm start:dev              # Backend starts on http://localhost:3001

# 2. Start this frontend (from this directory)
pnpm dev                    # Frontend starts on http://localhost:3000
```

## Backend Contract

The NestJS backend exposes:

- **REST API**: `http://localhost:3001/api` (OpenAPI schema at `http://localhost:3001/api/docs`)
- **GraphQL**: `http://localhost:3001/graphql`
- **Auth**: `http://localhost:3001/api/auth`

All three are consumed via the clients in `src/lib/` — never call them directly with `fetch`.
