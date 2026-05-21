---
paths:
  - "src/app/**/_hooks/**/*.{ts,tsx}"
  - "src/app/**/_actions/**/*.{ts,tsx}"
  - "src/hooks/**/*.{ts,tsx}"
  - "src/actions/**/*.{ts,tsx}"
---

# Data Loading

Use this matrix to decide where data loading and mutation code lives:

| Operation                 | Mechanism                         | Client                 |
| ------------------------- | --------------------------------- | ---------------------- |
| GraphQL query (client)    | hook (`useQuery`)                 | urql                   |
| GraphQL query (server)    | `graphqlClient` instance directly | `@/lib/graphql/client` |
| GraphQL mutation (client) | hook (`useMutation`)              | urql                   |
| GraphQL mutation (server) | `graphqlClient` instance directly | `@/lib/graphql/client` |
| GraphQL subscription      | hook (`useSubscription`)          | urql                   |
| REST read                 | hook (wrapping `restClient`)      | `@/lib/rest/client`    |
| REST mutation             | server action (`restClient`)      | `@/lib/rest/client`    |
| Auth / session (reactive) | hook (`useSession`)               | `@/lib/auth/client`    |
| Auth / session (one-shot) | `signIn`, `signOut`, `getSession` | `@/lib/auth/client`    |

Name REST read hooks after their resource (e.g. `useUsers`, `useProfile`).

## Anti-patterns

- NEVER call a server action inside a hook — wire actions to components via form `action` props or event handlers
- NEVER use urql hooks inside a server action — they are client-only React hooks
- !IMPORTANT NEVER call `fetch()` directly — always route data loading through the typed clients (`restClient`, `graphqlClient`, `authClient`)
