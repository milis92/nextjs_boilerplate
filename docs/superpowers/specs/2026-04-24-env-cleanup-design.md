# Env Var Cleanup — Design Spec

**Date:** 2026-04-24  
**Status:** Approved

## Problem

`NEXT_PUBLIC_API_URL` is used as a base URL that consumers extend via string concatenation:

- `graphql-client.ts` appends `/graphql` and swaps protocol to `ws://`
- `auth-client.ts` appends `/api/auth`
- `next.config.ts` extracts `.origin` for CSP headers

This means the actual endpoint each consumer connects to is an implicit derivation — not visible in env, not validated individually, and fragile if paths ever diverge.

## Goal

Every value read from the environment is the exact value a consumer needs. No string concatenation, no protocol swapping, no URL parsing in application code.

## New Env Var Schema

Replace `NEXT_PUBLIC_API_URL` with four purpose-named vars:

```
# App
NEXT_PUBLIC_APP_NAME="Spend Dash"
NEXT_PUBLIC_APP_URL=https://dash.example.com   # optional, prod only

# API endpoints
NEXT_PUBLIC_REST_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3001/graphql
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
```

All URL vars are validated at startup via `@t3-oss/env-nextjs` with `z.url()` (`NEXT_PUBLIC_APP_URL` is optional). A missing or malformed value throws before any client connects.

## File-by-File Changes

### `src/lib/env.ts`

- Remove `NEXT_PUBLIC_API_URL`
- Add `NEXT_PUBLIC_REST_URL`, `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_GRAPHQL_WS_URL`, `NEXT_PUBLIC_AUTH_URL` — all `z.url()`
- Keep `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`

### `src/lib/rest-client.ts`

- `baseUrl: Env.NEXT_PUBLIC_REST_URL`

### `src/lib/graphql-client.ts`

- `url` for HTTP client: `Env.NEXT_PUBLIC_GRAPHQL_URL`
- `url` for WS client: `Env.NEXT_PUBLIC_GRAPHQL_WS_URL`
- Delete `toWsUrl()` helper entirely

### `src/lib/auth-client.ts`

- `baseURL: Env.NEXT_PUBLIC_AUTH_URL`

### `next.config.ts`

- `apiOrigin`: `new URL(Env.NEXT_PUBLIC_REST_URL).origin`
- `wsOrigin`: `new URL(Env.NEXT_PUBLIC_GRAPHQL_WS_URL).origin`
- This is the only remaining derivation; it lives exclusively in infrastructure config, not application code

### `src/utils/app-config.ts`

- No change; already reads `Env.NEXT_PUBLIC_APP_NAME` correctly

### `.env.example`

- Replace `NEXT_PUBLIC_API_URL` with the four new endpoint vars, each with a comment describing its consumer

## What Stays the Same

- Validation library (`@t3-oss/env-nextjs`) and overall `env.ts` structure
- `app-config.ts` as the app-level config layer above `env.ts`
- Credentials mode on all clients (`credentials: "include"`)

## Out of Scope

- `OPENAPI_SPEC_PATH` — build-time only, not loaded by Next.js at runtime, no change needed
- Adding new endpoints beyond the four listed above
