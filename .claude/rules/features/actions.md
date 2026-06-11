---
paths:
  - "src/app/**/_actions/**"
  - "src/actions/**"
---

# Server Actions

Place all feature mutations in `_actions/` files — never inline them in pages or layouts.

## Co-location placement

Place action files at the lowest level that covers all consumers:

| Level         | Location            | When to use                             |
| ------------- | ------------------- | --------------------------------------- |
| Route-private | `[route]/_actions/` | Used by exactly one route               |
| Group-shared  | `(group)/_actions/` | Used by 2+ routes within the same group |
| App-shared    | `src/actions/`      | Used by 2+ route groups                 |

- Start every new action at route-private; escalate only when a second consumer appears.

## File naming

- Name files `<domain>.actions.ts` — e.g., `auth.actions.ts`, `billing.actions.ts`
- Put all actions for one domain in one file

## Required structure

!IMPORTANT Every actions file must start with `"use server"`.

Every action must:

1. Validate all arguments with Zod before touching the backend
2. Return a typed result object — never `any`
3. Never throw to the client — catch errors and return them in the result shape

Use the appropriate client per the matrix in `data-loading.md`.

@.claude/rules/features/examples/actions.ts
