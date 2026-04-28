# Env Var Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `NEXT_PUBLIC_API_URL` base URL with four explicit, purpose-named endpoint vars so no consumer derives or constructs a URL at runtime.

**Architecture:** `src/lib/env.ts` is the single validated source for all env vars. Each client (`rest-client`, `graphql-client`, `auth-client`) reads exactly the URL it needs — no concatenation. `next.config.ts` (infrastructure config only) retains two `new URL(...).origin` calls for CSP header generation.

**Tech Stack:** `@t3-oss/env-nextjs` (env validation), `zod` (schema), `openapi-fetch` (REST), `urql` + `graphql-ws` (GraphQL), `better-auth` (auth), Next.js

---

## File Map

| File | Change |
|---|---|
| `src/lib/env.ts` | Remove `NEXT_PUBLIC_API_URL`; add 4 new `z.url()` vars |
| `src/lib/rest-client.ts` | `baseUrl` → `Env.NEXT_PUBLIC_REST_URL` |
| `src/lib/graphql-client.ts` | Use `Env.NEXT_PUBLIC_GRAPHQL_URL` + `Env.NEXT_PUBLIC_GRAPHQL_WS_URL`; delete `toWsUrl()` |
| `src/lib/auth-client.ts` | `baseURL` → `Env.NEXT_PUBLIC_AUTH_URL` |
| `next.config.ts` | Derive origins from new vars |
| `knip.config.ts` | Add `rest-client.ts` to `ignore`; add `openapi-fetch` to `ignoreDependencies` |
| `.env.example` | Replace old var with four new vars + comments |

---

### Task 1: Update `env.ts`

Changing `env.ts` first lets TypeScript immediately flag every stale `Env.NEXT_PUBLIC_API_URL` reference — those errors are your failing tests.

**Files:**
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const Env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_REST_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_WS_URL: z.url(),
    NEXT_PUBLIC_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
  },
  shared: {
    NODE_ENV: z.enum(["test", "development", "production"]).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_REST_URL: process.env.NEXT_PUBLIC_REST_URL,
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_GRAPHQL_WS_URL: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
  },
})
```

- [ ] **Step 2: Run typecheck — expect failures (these are your red tests)**

```bash
pnpm typecheck
```

Expected: errors referencing `NEXT_PUBLIC_API_URL` in `graphql-client.ts`, `rest-client.ts`, `auth-client.ts`, and `next.config.ts`. The next four tasks fix them one by one.

---

### Task 2: Update `graphql-client.ts`

**Files:**
- Modify: `src/lib/graphql-client.ts`

- [ ] **Step 1: Replace the full file content**

`toWsUrl()` is deleted — the WS URL is now explicit in env.

```ts
"use client"

import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
  type Exchange,
} from "urql"
import { createClient as createWSClient } from "graphql-ws"
import { Env } from "@/lib/env"

const wsClient =
  typeof window === "undefined"
    ? null
    : createWSClient({
        url: Env.NEXT_PUBLIC_GRAPHQL_WS_URL,
        connectionParams: () => ({}),
        on: {
          error: (err) =>
            console.error("[graphql-ws] subscription socket error", err),
          closed: (event) =>
            console.warn("[graphql-ws] subscription socket closed", event),
        },
      })

const exchanges: Exchange[] = [cacheExchange, fetchExchange]

if (wsClient) {
  const client = wsClient
  exchanges.push(
    subscriptionExchange({
      forwardSubscription: (request) => ({
        subscribe: (sink) => ({
          unsubscribe: client.subscribe(
            { ...request, query: request.query ?? "" },
            sink
          ),
        }),
      }),
    })
  )
}

export const graphqlClient = new Client({
  url: Env.NEXT_PUBLIC_GRAPHQL_URL,
  fetchOptions: { credentials: "include" },
  exchanges,
})
```

---

### Task 3: Update `rest-client.ts`

**Files:**
- Modify: `src/lib/rest-client.ts`

- [ ] **Step 1: Replace the full file content**

```ts
"use client"

import createClient from "openapi-fetch"
import type { paths } from "@/lib/rest/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_REST_URL,
  credentials: "include",
})
```

---

### Task 4: Update `auth-client.ts`

**Files:**
- Modify: `src/lib/auth-client.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { createAuthClient } from "better-auth/react"
import { Env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: Env.NEXT_PUBLIC_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
```

---

### Task 5: Update `next.config.ts`

`next.config.ts` is infrastructure config, not application code. It retains two `new URL(...).origin` calls to extract the hostname for CSP `connect-src` — no path construction happens here.

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace the two derived-URL lines**

Change:
```ts
const apiUrl = Env.NEXT_PUBLIC_API_URL
const apiOrigin = new URL(apiUrl).origin
const wsOrigin = apiOrigin.replace(/^http/, "ws")
```

To:
```ts
const apiOrigin = new URL(Env.NEXT_PUBLIC_REST_URL).origin
const wsOrigin = new URL(Env.NEXT_PUBLIC_GRAPHQL_WS_URL).origin
```

The rest of `next.config.ts` is unchanged.

- [ ] **Step 2: Run typecheck — expect all errors resolved**

```bash
pnpm typecheck
```

Expected: exit 0, no errors.

---

### Task 6: Fix knip config

`rest-client.ts` has no UI consumers yet (it's a library module, same situation as `auth-client.ts`). Add it to knip's ignore list so the pre-commit check passes.

**Files:**
- Modify: `knip.config.ts`

- [ ] **Step 1: Add `rest-client.ts` to `ignore` and `openapi-fetch` to `ignoreDependencies`**

In the `ignore` array, add `"src/lib/rest-client.ts"` after `"src/lib/auth-client.ts"`:

```ts
ignore: [
  "src/components/ui/**",
  "src/lib/auth-client.ts",
  "src/lib/rest-client.ts",   // ← add this line
  "src/lib/i18n.ts",
  "src/lib/i18n-actions.ts",
  "src/types/i18n.ts",
  "src/utils/app-config.ts",
],
```

In the `ignoreDependencies` array, add `"openapi-fetch"` after `"better-auth"`:

```ts
ignoreDependencies: [
  "@eslint/eslintrc",
  "vitest-browser-react",
  "better-auth",
  "openapi-fetch",   // ← add this line
  "lucide-react",
  "openapi-typescript",
  "tsx",
],
```

- [ ] **Step 2: Run knip — expect clean output**

```bash
pnpm check:deps
```

Expected: exit 0, no unused files or dependencies reported.

---

### Task 7: Update `.env.example` and commit

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Replace the full file content**

```bash
# Display name of the application.
NEXT_PUBLIC_APP_NAME="Nextjs Boilerplate"

# Public base URL of this Next.js app.
# Leave unset in local dev; set in production deployments.
# NEXT_PUBLIC_APP_URL=https://dash.example.com

################################
# API Endpoints                #
# Each client reads its own    #
# explicit URL — no derivation #
################################

# REST client base URL (openapi-fetch)
NEXT_PUBLIC_REST_URL=http://localhost:3001

# GraphQL HTTP endpoint (urql)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# GraphQL WebSocket endpoint (graphql-ws, subscriptions)
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3001/graphql

# Auth endpoint (better-auth)
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth

################################
# REST API Codegen             #
################################

# Path at which the backend serves its OpenAPI spec.
# Used only during `pnpm codegen:rest` — not loaded at runtime.
OPENAPI_SPEC_PATH="/openapi.json"
```

- [ ] **Step 2: Update your local `.env` or `.env.local`**

Add the four new vars and remove `NEXT_PUBLIC_API_URL`. Use the same host values you had before:

```bash
NEXT_PUBLIC_REST_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3001/graphql
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
```

- [ ] **Step 3: Run full pre-commit checks manually**

```bash
pnpm typecheck && pnpm check:deps
```

Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/env.ts src/lib/rest-client.ts src/lib/graphql-client.ts src/lib/auth-client.ts next.config.ts knip.config.ts .env.example
git commit -m "refactor: replace NEXT_PUBLIC_API_URL with explicit per-client endpoint vars"
```
