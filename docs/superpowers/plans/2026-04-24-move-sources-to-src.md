# Move Sources to src/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all source directories into `src/` and update every config that references them so all tooling (typecheck, lint, unit tests, build) keeps passing.

**Architecture:** Use `git mv` to preserve history, then surgically update the seven config files that hardcode source paths. Next.js natively supports the `src/` layout — when it detects `src/app/`, it treats that as the app root with no extra config.

**Tech Stack:** Next.js 16, TypeScript, Vitest, Playwright, Knip, ESLint, Prettier, GraphQL Codegen, openapi-typescript, shadcn/ui (components.json)

---

### Task 1: Move source directories into src/ with git mv

**Files:**
- Move: `app/` → `src/app/`
- Move: `components/` → `src/components/`
- Move: `lib/` → `src/lib/`
- Move: `locales/` → `src/locales/`
- Move: `types/` → `src/types/`
- Move: `utils/` → `src/utils/`

- [ ] **Step 1: Create src/ and move all directories**

```bash
mkdir src
git mv app src/app
git mv components src/components
git mv lib src/lib
git mv locales src/locales
git mv types src/types
git mv utils src/utils
```

- [ ] **Step 2: Verify the moves**

```bash
ls src/
```

Expected output:
```
app  components  lib  locales  types  utils
```

---

### Task 2: Update tsconfig.json paths alias

**Files:**
- Modify: `tsconfig.json`

The `@/*` alias currently resolves from repo root (`./*`). It must now resolve from `src/`.

- [ ] **Step 1: Update paths in tsconfig.json**

Change:
```json
"paths": {
  "@/*": ["./*"],
  "@/public/*": ["./public/*"]
}
```

To:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/public/*": ["./public/*"]
}
```

- [ ] **Step 2: Verify typecheck passes**

```bash
pnpm typecheck
```

Expected: no errors.

---

### Task 3: Update next.config.ts imports

**Files:**
- Modify: `next.config.ts`

`next.config.ts` has two direct relative imports that reference `lib/` from the project root. Both must gain the `src/` prefix.

- [ ] **Step 1: Update both imports in next.config.ts**

Change line 3:
```ts
import "./lib/env"
```
To:
```ts
import "./src/lib/env"
```

Change line 67:
```ts
const nextConfig = createNextIntlPlugin("./lib/i18n.ts")(baseConfig)
```
To:
```ts
const nextConfig = createNextIntlPlugin("./src/lib/i18n.ts")(baseConfig)
```

- [ ] **Step 2: Verify typecheck still passes**

```bash
pnpm typecheck
```

Expected: no errors.

---

### Task 4: Update codegen.ts document globs and output path

**Files:**
- Modify: `codegen.ts`

GraphQL codegen currently scans `app/**`, `components/**`, `lib/**` and writes to `./lib/gql/`. All three globs and the output key need the `src/` prefix.

- [ ] **Step 1: Update document globs and generates key**

Change:
```ts
documents: [
  "app/**/*.{ts,tsx}",
  "components/**/*.{ts,tsx}",
  "lib/**/*.{ts,tsx}",
],
```
To:
```ts
documents: [
  "src/app/**/*.{ts,tsx}",
  "src/components/**/*.{ts,tsx}",
  "src/lib/**/*.{ts,tsx}",
],
```

Change:
```ts
generates: {
  "./lib/gql/": {
```
To:
```ts
generates: {
  "./src/lib/gql/": {
```

---

### Task 5: Update codegen.rest.ts output directory

**Files:**
- Modify: `codegen.rest.ts`

The REST codegen writes generated types to `lib/rest/api.ts`. After the move it must write to `src/lib/rest/api.ts`.

- [ ] **Step 1: Update outDir constant**

Change:
```ts
const outDir = "lib/rest"
```
To:
```ts
const outDir = "src/lib/rest"
```

---

### Task 6: Update vitest.config.mts coverage and test paths

**Files:**
- Modify: `vitest.config.mts`

Vitest's coverage `include` and both project `include` arrays hardcode directory names without `src/`.

- [ ] **Step 1: Update coverage.include**

Change:
```ts
coverage: {
  include: ["app/**/*", "components/**/*", "lib/**/*", "hooks/**/*"],
```
To:
```ts
coverage: {
  include: ["src/app/**/*", "src/components/**/*", "src/lib/**/*", "src/hooks/**/*"],
```

- [ ] **Step 2: Update unit project include**

Change:
```ts
include: ["lib/**/*.test.{js,ts}", "app/**/*.test.{js,ts}"],
exclude: ["hooks/**/*.test.ts"],
```
To:
```ts
include: ["src/lib/**/*.test.{js,ts}", "src/app/**/*.test.{js,ts}"],
exclude: ["src/hooks/**/*.test.ts"],
```

- [ ] **Step 3: Update ui project include**

Change:
```ts
include: ["**/*.test.tsx", "hooks/**/*.test.ts"],
```
To:
```ts
include: ["src/**/*.test.tsx", "src/hooks/**/*.test.ts"],
```

- [ ] **Step 4: Run unit tests**

```bash
pnpm test
```

Expected: all tests pass (or "no tests found" with exit 0 thanks to `--passWithNoTests`).

---

### Task 7: Update knip.config.ts ignore paths

**Files:**
- Modify: `knip.config.ts`

Every path in the `ignore` array references a source file without the `src/` prefix.

- [ ] **Step 1: Update all ignore entries**

Change:
```ts
ignore: [
  "components/ui/**",
  "lib/auth-client.ts",
  "lib/i18n.ts",
  "lib/i18n-actions.ts",
  "types/i18n.ts",
  "utils/app-config.ts",
],
```
To:
```ts
ignore: [
  "src/components/ui/**",
  "src/lib/auth-client.ts",
  "src/lib/i18n.ts",
  "src/lib/i18n-actions.ts",
  "src/types/i18n.ts",
  "src/utils/app-config.ts",
],
```

- [ ] **Step 2: Verify knip passes**

```bash
pnpm check:deps
```

Expected: no unused exports or dependencies reported.

---

### Task 8: Update components.json tailwind CSS path

**Files:**
- Modify: `components.json`

shadcn reads `components.json` to know where the global CSS file lives. The path must reflect the new location.

- [ ] **Step 1: Update tailwind.css path**

Change:
```json
"tailwind": {
  "config": "",
  "css": "app/globals.css",
```
To:
```json
"tailwind": {
  "config": "",
  "css": "src/app/globals.css",
```

---

### Task 9: Clear build cache and run full tooling verification

**Files:** none (verification only)

A stale `.next` cache can produce false positives or negatives. Clear it, then run every tooling check.

- [ ] **Step 1: Delete .next cache**

```bash
rm -rf .next
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: exit 0, no errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: exit 0, no errors.

- [ ] **Step 4: Run unit tests**

```bash
pnpm test
```

Expected: exit 0.

- [ ] **Step 5: Run dependency check**

```bash
pnpm check:deps
```

Expected: exit 0.

- [ ] **Step 6: Run Next.js build**

```bash
pnpm build
```

Expected: exit 0, successful build output.

---

### Task 10: Commit

- [ ] **Step 1: Stage and commit all changes**

```bash
git add src/ tsconfig.json next.config.ts codegen.ts codegen.rest.ts vitest.config.mts knip.config.ts components.json
git commit -m "refactor: move sources into src/ directory"
```
