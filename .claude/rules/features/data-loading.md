---
paths:
  - "src/app/**/_module/hooks/**"
  - "src/app/**/_module/actions/**"
---

## Data Loading

Use this matrix to decide where data loading and mutation code lives:

| Operation        | Mechanism                    | Client              |
| ---------------- | ---------------------------- | ------------------- |
| GraphQL query    | hook (`useQuery`)            | urql                |
| GraphQL mutation | hook (`useMutation`)         | urql                |
| REST read        | hook (wrapping `restClient`) | `@/lib/rest.client` |
| REST mutation    | server action (`restClient`) | `@/lib/rest.client` |
| Auth / session   | hook (`authClient`)          | `@/lib/auth.client` |

REST read hooks have no shared name — each feature writes its own (e.g. `useUsers`, `useProfile`). The hook wraps `restClient` and returns typed data plus loading/error state.

**Hooks** (`_module/hooks/`) are for client-side, reactive data — they run in the browser and re-render on state change.

**Server actions** (`_module/actions/`) are for server-side one-shot mutations — they run on the server and return a typed result to the client.

### Rules

- Never call `fetch()` directly — always use the typed clients above
- Never call a server action inside a hook — wire actions to components via form `action` props or event handlers
- Never use urql hooks inside a server action — they are client-only React hooks
