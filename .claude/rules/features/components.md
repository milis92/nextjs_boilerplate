---
paths:
  - "src/app/**/_module/components/**"
---

## Feature Components

Components in `_module/components/` are private to their feature — never imported by other features.

### Server vs Client

- Default to React Server Components — omit `"use client"` unless the component genuinely requires it
- Add `"use client"` only when the component needs browser APIs (`window`, `document`), event handlers, or React hooks (`useState`, `useEffect`, `useContext`)
- Keep `"use client"` as deep in the tree as possible — push it to leaf components, not wrappers

### File naming

- One component per file
- File name matches the component name in kebab-case: `login-form.tsx` exports `LoginForm`
- No type segment suffix needed for feature components — `login-form.tsx` not `login-form.component.tsx`
- Named export for every component (default export only for Next.js reserved files)

### Imports

- Never import directly from `src/lib/gql/` or `src/lib/rest/generated/` — use `@/lib/rest.client` and urql hooks
- Never import from another feature's `_module/` — move shared code to `src/components/`

### i18n

- Use `useTranslations('<Namespace>')` from `next-intl` to access localised strings
- The namespace matches the feature's locale message namespace (e.g. `useTranslations('AuthLogin')`)
- Never hardcode user-visible strings — always use translation keys

### Anti-patterns

- NEVER fetch data inside a component with raw `fetch()` — use hooks from `_module/hooks/` or pass data as props
- NEVER call server actions inline in JSX — import them from `_module/actions/` and wire via a form or handler
- NEVER export default from component files — named exports only
