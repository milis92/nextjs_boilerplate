---
paths:
  - "src/app/**/_hooks/**"
  - "src/app/**/_actions/**"
---

## Data Loading

Use this matrix to decide where data loading and mutation code lives:

| Operation              | Mechanism                         | Client                 |
| ---------------------- | --------------------------------- | ---------------------- |
| GraphQL query (client) | hook (`useQuery`)                 | urql                   |
| GraphQL query (server) | `graphqlClient` instance directly | `@/lib/graphql/client` |
| GraphQL mutation       | hook (`useMutation`)              | urql                   |
| REST read              | hook (wrapping `restClient`)      | `@/lib/rest/client`    |
| REST mutation          | server action (`restClient`)      | `@/lib/rest/client`    |
| Auth / session         | hook (`authClient`)               | `@/lib/auth/client`    |

**Hooks vs direct client:** urql hooks (`useQuery`, `useMutation`) are client-only React hooks — use them in Client Components. For server-side GraphQL queries in Server Components or server actions, use the `graphqlClient` instance from `@/lib/graphql/client` directly.

REST read hooks have no shared name — each feature writes its own (e.g. `useUsers`, `useProfile`), placed in the feature's `_hooks/` folder. The hook wraps `restClient` and returns typed data plus loading/error state.

**Hooks** (`_hooks/`) are for client-side, reactive data — they run in the browser and re-render on state change.

**Server actions** (`_actions/`) are for server-side one-shot mutations — they run on the server and return a typed result to the client.

### Rules

- Never call `fetch()` directly — always use the typed clients above
- Never call a server action inside a hook — wire actions to components via form `action` props or event handlers
- Never use urql hooks inside a server action — they are client-only React hooks
