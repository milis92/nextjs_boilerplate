---
paths:
  - "src/app/**/_hooks/**/*.{ts,tsx}"
  - "src/hooks/**/*.{ts,tsx}"
---

# Feature Hooks

Place custom hooks in `_hooks/` directories — never inline them in pages or layouts.

## Co-location placement

Place hook files at the lowest level that covers all consumers:

| Level         | Location          | When to use                             |
| ------------- | ----------------- | --------------------------------------- |
| Route-private | `[route]/_hooks/` | Used by exactly one route               |
| Group-shared  | `(group)/_hooks/` | Used by 2+ routes within the same group |
| App-shared    | `src/hooks/`      | Used by 2+ route groups                 |

Always start new hooks at route-private; escalate when a second consumer appears.

## File naming

- Put one hook per file
- Name the file after the hook in kebab-case: `use-session.ts` exports `useSession`

## Return values

Always return a typed object, never a positional tuple: `return { data, isLoading, error }`

## Anti-patterns

- !IMPORTANT Never re-implement session reads with `getSession` + `useState` — use `useSession` from `@/lib/auth/client` for reactive session state
- Choose the correct data client per the matrix in `data-loading.md` — never bypass the typed clients
