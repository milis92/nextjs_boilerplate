---
paths:
  - "src/app/**/_actions/**"
---

## Server Actions

Server actions in `_actions/` are the only place feature mutations live.

### File naming

- Named `<domain>.actions.ts` — e.g., `auth.actions.ts`, `billing.actions.ts`
- All actions for one domain in one file

### Required structure

Every actions file must start with `"use server"`. Every action must:

1. Validate all arguments with Zod before touching the backend
2. Return a typed result object — `{ success: true; data: T }` or `{ success: false; error: string }`
3. Never throw to the client — catch errors and return them in the result shape

Example skeleton:

```ts
"use server"

import { z } from "zod"
import { restClient } from "@/lib/rest/client"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

/** Authenticates a user and returns a session token. */
export async function login(
  input: z.infer<typeof loginSchema>
): Promise<
  { success: true; token: string } | { success: false; error: string }
> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  const { data, error } = await restClient.POST("/auth/login", {
    body: parsed.data,
  })
  if (error) {
    return { success: false, error: String(error) }
  }
  return { success: true, token: data.token }
}
```

### Imports

Use the appropriate client from the data-loading matrix in `data-loading.md`:

- `restClient` from `@/lib/rest/client` for REST mutations
- `authClient` from `@/lib/auth/client` for authentication operations
- Server actions cannot use urql hooks — those are client-only React hooks

### Anti-patterns

- NEVER define server actions in `page.tsx` or `layout.tsx`
- NEVER skip Zod validation — always validate before using action arguments
- NEVER throw raw errors to the client — return `{ success: false, error: string }` instead
- NEVER return `any` — always type the result
- NEVER call a server action inside a hook — wire actions to components via form `action` props or event handlers (see `data-loading.md`)
