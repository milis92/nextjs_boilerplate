# REST API Client Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a typed REST client layer with OpenAPI codegen, mirroring the existing GraphQL/urql setup.

**Architecture:** Install `openapi-fetch` (runtime typed fetch wrapper) and `openapi-typescript` + `tsx` (dev tools). A `codegen.rest.ts` script generates TypeScript types from the backend's OpenAPI spec into `lib/rest/api.ts` (gitignored). A single `lib/rest-client.ts` exports a typed `restClient` instance using those types, with the same `credentials: "include"` auth approach as `lib/graphql-client.ts`.

**Tech Stack:** `openapi-fetch`, `openapi-typescript`, `tsx`, `pnpm`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `package.json` | Modify | Add `openapi-fetch`, `openapi-typescript`, `tsx` + new scripts |
| `.gitignore` | Modify | Ignore `lib/rest/` (generated output) |
| `.env.example` | Modify | Document `OPENAPI_SPEC_PATH` with full comment block |
| `.env.local` | Modify | Set `OPENAPI_SPEC_PATH` default for local dev |
| `codegen.rest.ts` | Create | Programmatic OpenAPI → TypeScript codegen script |
| `lib/rest/api.ts` | Generated | Types from OpenAPI spec — gitignored, never edited by hand |
| `lib/rest-client.ts` | Create | Typed REST client singleton |
| `lib/rest-client.test.ts` | Create | Smoke test verifying the client exports correctly |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add packages**

```bash
pnpm add openapi-fetch
pnpm add -D openapi-typescript tsx
```

Expected: both packages appear in `package.json` under their respective dependency sections.

- [ ] **Step 2: Verify**

```bash
grep -E '"openapi-fetch"|"openapi-typescript"|"tsx"' package.json
```

Expected output (versions will vary):
```
"openapi-fetch": "^x.x.x",
...
"openapi-typescript": "^x.x.x",
"tsx": "^x.x.x",
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add openapi-fetch, openapi-typescript, tsx"
```

---

### Task 2: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add the generated REST output directory**

Open `.gitignore`. After the existing block:

```
# generated graphql client
/lib/gql/
```

Add:

```
# generated REST client
/lib/rest/
```

- [ ] **Step 2: Verify**

```bash
grep "lib/rest" .gitignore
```

Expected:
```
/lib/rest/
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore generated REST client types"
```

---

### Task 3: Add OPENAPI_SPEC_PATH to environment files

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: Append REST section to .env.example**

Append to the end of `.env.example`:

```bash
################################
# REST API Configuration       #
################################

# The URL path at which the backend serves its OpenAPI spec.
# Combined with NEXT_PUBLIC_API_URL at codegen time to form the full spec URL.
# This variable is only read during `pnpm codegen:rest` — it is not loaded
# by Next.js at runtime and does not need the NEXT_PUBLIC_ prefix.
# Example values: "/openapi.json", "/docs/openapi.json", "/api-docs/openapi.yaml"
# Default: "/openapi.json"
OPENAPI_SPEC_PATH="/openapi.json"
```

- [ ] **Step 2: Append OPENAPI_SPEC_PATH to .env.local**

Append to the end of `.env.local`:

```bash
OPENAPI_SPEC_PATH="/openapi.json"
```

- [ ] **Step 3: Commit**

`.env.local` is gitignored — only commit `.env.example`.

```bash
git add .env.example
git commit -m "chore: add OPENAPI_SPEC_PATH env variable"
```

---

### Task 4: Create codegen.rest.ts and add npm scripts

**Files:**
- Create: `codegen.rest.ts`
- Modify: `package.json`

- [ ] **Step 1: Create codegen.rest.ts at the project root**

```ts
import openapiTS, { astToString } from "openapi-typescript"
import { writeFileSync, mkdirSync } from "fs"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const specPath = process.env.OPENAPI_SPEC_PATH ?? "/openapi.json"
const specUrl = `${apiUrl}${specPath}`
const outDir = "lib/rest"
const outFile = `${outDir}/api.ts`

mkdirSync(outDir, { recursive: true })

const ast = await openapiTS(new URL(specUrl))
writeFileSync(outFile, astToString(ast))

console.log(`✓ REST types generated: ${specUrl} → ${outFile}`)
```

- [ ] **Step 2: Add scripts to package.json**

In `package.json`, after the `"codegen:watch"` line add:

```json
"codegen:rest": "tsx codegen.rest.ts",
"codegen:rest:watch": "tsx watch codegen.rest.ts",
```

The full scripts block should look like:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "format": "prettier --write \"**/*.{ts,tsx,mts,mjs}\"",
  "typecheck": "tsc --noEmit",
  "codegen": "graphql-codegen",
  "codegen:watch": "graphql-codegen --watch",
  "codegen:rest": "tsx codegen.rest.ts",
  "codegen:rest:watch": "tsx watch codegen.rest.ts",
  "test": "vitest run --passWithNoTests",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "check:deps": "knip",
  "prepare": "lefthook install"
}
```

- [ ] **Step 3: Run codegen to generate lib/rest/api.ts locally**

Ensure the backend is running at `http://localhost:3001`, then:

```bash
pnpm codegen:rest
```

Expected output:
```
✓ REST types generated: http://localhost:3001/openapi.json → lib/rest/api.ts
```

Verify the file was created:

```bash
head -5 lib/rest/api.ts
```

Expected: TypeScript type declarations (e.g. `export type paths = {` or `export interface paths {`).

- [ ] **Step 4: Commit**

`lib/rest/api.ts` is gitignored — do not add it.

```bash
git add codegen.rest.ts package.json
git commit -m "feat: add REST API codegen script"
```

---

### Task 5: Implement lib/rest-client.ts (TDD)

**Files:**
- Create: `lib/rest-client.test.ts`
- Create: `lib/rest-client.ts`

> **Note:** `lib/rest/api.ts` must exist locally (generated in Task 4) before TypeScript can resolve the `paths` import. It will not be present in a fresh checkout — developers must run `pnpm codegen:rest` as part of their local setup.

- [ ] **Step 1: Write the failing test**

Create `lib/rest-client.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { restClient } from "./rest-client"

describe("restClient", () => {
  it("is exported and defined", () => {
    expect(restClient).toBeDefined()
  })

  it("exposes typed HTTP methods", () => {
    expect(typeof restClient.GET).toBe("function")
    expect(typeof restClient.POST).toBe("function")
    expect(typeof restClient.PUT).toBe("function")
    expect(typeof restClient.DELETE).toBe("function")
    expect(typeof restClient.PATCH).toBe("function")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test --project=unit
```

Expected: FAIL — `Cannot find module './rest-client'`

- [ ] **Step 3: Implement lib/rest-client.ts**

Create `lib/rest-client.ts`:

```ts
"use client"

import createClient from "openapi-fetch"
import type { paths } from "@/lib/rest/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_API_URL,
  credentials: "include",
})
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test --project=unit
```

Expected: PASS — 2 test suites, both green.

- [ ] **Step 5: Run full typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/rest-client.ts lib/rest-client.test.ts
git commit -m "feat: add typed REST client"
```
