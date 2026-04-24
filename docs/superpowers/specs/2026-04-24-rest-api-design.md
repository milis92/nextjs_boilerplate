# REST API Client Infrastructure

**Date:** 2026-04-24
**Status:** Approved

## Overview

Add a typed REST client layer to the boilerplate alongside the existing GraphQL (urql) layer. The setup generates TypeScript types from the backend's OpenAPI spec and exposes a single typed client instance — mirroring the existing `lib/graphql-client.ts` pattern.

## Dependencies

| Package | Type | Role |
|---|---|---|
| `openapi-fetch` | runtime | Typed fetch wrapper |
| `openapi-typescript` | devDependency | Codegen CLI — generates types from OpenAPI spec |

## Codegen

A new `codegen.rest.ts` file (parallel to `codegen.ts`) drives type generation using `openapi-typescript`'s programmatic Node API:

```ts
import openapiTS, { astToString } from "openapi-typescript"
import { writeFileSync } from "fs"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const specPath = process.env.OPENAPI_SPEC_PATH ?? "/openapi.json"

const ast = await openapiTS(new URL(`${apiUrl}${specPath}`))
writeFileSync("lib/rest/api.ts", astToString(ast))
```

New scripts in `package.json`:
- `codegen:rest` — `tsx codegen.rest.ts`, one-shot generation
- `codegen:rest:watch` — `tsx watch codegen.rest.ts`, re-generates on spec changes

Generated output: `lib/rest/api.ts` — gitignored (generated, not committed)

## Client — `lib/rest-client.ts`

```ts
import createClient from "openapi-fetch"
import type { paths } from "@/lib/rest/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_API_URL,
  credentials: "include",
})
```

- `credentials: "include"` reuses the existing `better-auth` session cookie — no additional auth wiring needed.
- Usage: `restClient.GET("/expenses/{id}", { params: { path: { id } } })`

## Environment Variables

New variable added to `.env.example` under a `REST API Configuration` section:

| Variable | Default | Description |
|---|---|---|
| `OPENAPI_SPEC_PATH` | `/openapi.json` | Path at which the backend serves its OpenAPI spec, combined with `NEXT_PUBLIC_API_URL` at codegen time |

Documented with the full comment-block schema used throughout the project. Server-only (codegen time) — not prefixed with `NEXT_PUBLIC_`.

## File Structure

```
lib/
  graphql-client.ts     # existing
  rest-client.ts        # new — typed REST client instance
  rest/
    api.ts              # new — generated from OpenAPI spec (gitignored)
  gql/                  # existing — generated from GraphQL schema
codegen.ts              # existing
codegen.rest.ts         # new
```

## What is NOT in scope

- React hooks or React Query integration
- Per-endpoint helper functions (SDK-style)
- Runtime schema validation
- Error handling middleware beyond what `openapi-fetch` provides by default
