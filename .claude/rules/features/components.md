---
paths:
  - "src/app/**/_components/**"
  - "src/components/**"
---

## Feature Components

Components in `_components/` are private to their feature — never imported by other features.

### Server vs Client

- Default to React Server Components — omit `"use client"` unless the component genuinely requires it
- Add `"use client"` only when the component needs browser APIs (`window`, `document`), event handlers, or React hooks (`useState`, `useEffect`, `useContext`)
- Keep `"use client"` as deep in the tree as possible — push it to leaf components, not wrappers

### Co-location placement

Components start at the most specific location and escalate when a second consumer appears:

| Level         | Location               | When to use                                 |
| ------------- | ---------------------- | ------------------------------------------- |
| Route-private | `[route]/_components/` | Used by exactly one route                   |
| Group-shared  | `(group)/_components/` | Used by 2+ routes in the same feature group |
| App-shared    | `src/components/`      | Used by 2+ feature groups                   |

**Starting point:** new components always start at route-private.
**Escalation trigger:** a second consumer. Move up to group level when a second route needs it; move to `src/components/` when a second feature group needs it.

### File naming

- One component per file
- File name matches the component name in kebab-case: `login-form.tsx` exports `LoginForm`
- No type segment suffix needed for feature components — `login-form.tsx` not `login-form.component.tsx`
- Named export for every component (default export only for Next.js reserved files)

### Imports

- Never import directly from `src/lib/gql/` or `src/lib/rest/generated/` — use `@/lib/rest/client` and urql hooks
- Never import from a sibling route's `_components/` — escalate instead:
  - If 2 routes in the same feature need it → move to the feature's `_components/`
  - If 2+ features need it → move to `src/components/`

### i18n

- Use `useTranslations('<Namespace>')` from `next-intl` to access localised strings
- The namespace matches the feature's locale message namespace (e.g. `useTranslations('AuthLogin')`)
- Never hardcode user-visible strings — always use translation keys

### Anti-patterns

- NEVER fetch data inside a component with raw `fetch()` — use hooks from `_hooks/` or pass data as props
- NEVER call server actions inline in JSX — import them from `_actions/` and wire via a form or handler
- NEVER export default from component files — named exports only
