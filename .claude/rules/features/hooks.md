---
paths:
  - "src/app/**/_module/hooks/**"
---

## Feature Hooks

Hooks in `_module/hooks/` are private to their feature — never imported by other features.

### File naming

- One hook per file
- File name matches the hook name in kebab-case: `use-session.ts` exports `useSession`

### Return type

- Always return a typed object, never a positional tuple
- Good: `return { data, isLoading, error }`
- Bad: `return [user, loading, error] as const`

### Anti-patterns

- NEVER return an untyped object — define an explicit return type interface or let TypeScript infer from typed client results
- NEVER import from another feature's `_module/` — move to `src/hooks/` if the hook is needed by 2+ features
- NEVER call Next.js server actions inside a hook — see `data-loading.md` for the full decision matrix
