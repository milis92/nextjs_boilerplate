---
paths:
  - "src/app/**/_hooks/**"
  - "src/hooks/**"
---

## Feature Hooks

Hooks in `_hooks/` are private to their feature — never imported by other features.

### Co-location placement

Hooks follow the same escalation rule as components:

| Level         | Location          | When to use                           |
| ------------- | ----------------- | ------------------------------------- |
| Route-private | `[route]/_hooks/` | Used by exactly one route             |
| Group-shared  | `(group)/_hooks/` | Used by 2+ routes in the same feature |
| App-shared    | `src/hooks/`      | Used by 2+ feature groups             |

**Starting point:** new hooks always start at route-private.
**Escalation trigger:** a second consumer.

### File naming

- One hook per file
- File name matches the hook name in kebab-case: `use-session.ts` exports `useSession`

### Return type

- Always return a typed object, never a positional tuple
- Good: `return { data, isLoading, error }`
- Bad: `return [user, loading, error] as const`

### Anti-patterns

- NEVER return an untyped object — define an explicit return type interface or let TypeScript infer from typed client results
- NEVER use raw `fetch()` inside a hook — use `restClient` from `@/lib/rest/client` (REST) or urql hooks (GraphQL); see `data-loading.md`
- NEVER import from a sibling route's `_hooks/` — escalate instead:
  - If 2 routes in the same feature need it → move to the feature's `_hooks/`
  - If 2+ features need it → move to `src/hooks/`
- NEVER call Next.js server actions inside a hook — see `data-loading.md` for the full decision matrix
