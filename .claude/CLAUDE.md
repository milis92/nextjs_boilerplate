# Next.js Frontend Boilerplate — Agent Guide

This is a Next.js 16.2 frontend boilerplate.

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

!IMPORTANT Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.

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
pnpm graphql:generate       # Generate GraphQL types from schema → src/lib/graphql/generated/

# Maintenance
pnpm check:deps             # Detect unused dependencies (knip)
```

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

## Code Generation Workflow

!IMPORTANT: Before writing any code that calls a new REST or GraphQL endpoint:

1. Ensure the NestJS backend is running
2. Run the relevant generate command:
   - REST endpoint: `pnpm rest:generate`
   - GraphQL operation: `pnpm graphql:generate`
3. Only then write the consuming code
