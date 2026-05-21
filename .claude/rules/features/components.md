---
paths:
  - "src/app/**/_components/**"
  - "src/components/**"
---

# Component Conventions

Never import across feature boundaries without escalating.

## Co-location placement

Place components at the lowest level that covers all consumers:

| Level         | Location               | When to use                             |
| ------------- | ---------------------- | --------------------------------------- |
| Route-private | `[route]/_components/` | Used by exactly one route               |
| Group-shared  | `(group)/_components/` | Used by 2+ routes within the same group |
| App-shared    | `src/components/`      | Used by 2+ route groups                 |

Always start new components at route-private; escalate when a second consumer appears.

## File naming

- Put one component per file
- Name files in kebab-case matching the exported component name: `login-form.tsx` exports `LoginForm`
- Never add a type-segment suffix — `login-form.tsx` not `login-form.component.tsx`

## shadcn/ui

- Keep shadcn/ui primitives in `src/components/ui/` — add new ones with `pnpm dlx shadcn@latest add <component>`
- Use `cn()` from `@/components/ui/cn`
- Push `"use client"` as deep in the tree as possible — leaf components, not wrappers

## i18n

- Use `useTranslations('<Namespace>')` from `next-intl` in any component that renders user-visible strings
- !IMPORTANT The namespace is PascalCase matching the feature route, e.g. `useTranslations('AuthLogin')` for the `(auth)/login` route

## Anti-patterns

- NEVER import directly from `src/lib/graphql/` or `src/lib/rest/generated/` — use `@/lib/rest/client` and urql hooks
- NEVER call server actions inline in JSX — import them from `_actions/` and wire via a form or handler
- NEVER generate shadcn/ui components with a style other than `radix-nova`
