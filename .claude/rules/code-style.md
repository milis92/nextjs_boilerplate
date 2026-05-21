---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## Type Discipline

- Never use `any`. Use `unknown` at external boundaries (parsed JSON, third-party callbacks) and narrow with type
  guards.
- No type assertions (`as X`) except when receiving data from an external API where the shape is verified out-of-band.
  Leave a comment explaining why.
- Use `type` for union, intersection, and mapped types. Use `interface` for object shapes that may be extended. No `I`
  prefix on interfaces.

### Server Component props

Always type `params` and `searchParams` as `Promise<…>` in Next.js 15+ page and layout components. Define a `Props` type alias:

```tsx
type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}
```

Omit `params` and `searchParams` entirely when the component doesn't use them.

## Import Style

- Use `import type` for type-only imports; use inline `type` when the same module exports values and types.
- Use the `@/` path alias for any import that crosses a route boundary — anything in `src/lib/`, `src/components/`, a parent group's `_components/`/`_hooks/`/`_actions/`, or another feature entirely.
- Use relative `./` imports within the same co-located folder (e.g. `page.tsx` → `./_components/`, or files within the same `_components/` tree).
- Relative paths may go up at most one level within co-located directories (e.g. `../_hooks/use-foo` from `_components/`). Any path that would leave the route's co-located directories uses `@/` instead.

## Client Components

- Add `"use client"` only when a component uses browser APIs, event handlers, or React hooks (`useState`, `useEffect`, `useContext`)
- Push `"use client"` as deep in the tree as possible — leaf components, not wrappers
- `page.tsx`, `layout.tsx`, `route.ts`, and `*.actions.ts` files are server-side by default — never add `"use client"` to them
- `error.tsx` and `global-error.tsx` are exceptions — Next.js requires them to be Client Components

## Exports

- Named exports everywhere except Next.js reserved files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
  `not-found.tsx`, `route.ts`) which require a default export.
- NEVER export default from files in `src/components/`.

## Comments

Every exported symbol (class, function, type, interface, constant) must have a `/** */` JSDoc block. The block should
cover:

- **What it does** at a high level — one sentence is usually enough.
- **How it works** when the mechanism is not obvious from the name and types alone.
- **Why** a non-obvious design decision was made.

Omit `@param` / `@returns` tags unless the semantics are genuinely surprising.
Do not restate what the name or signature already says.

Use `//` inline only when the logic is non-obvious — explain **why**, not **what**.

## Naming conventions

| Thing                                                  | Convention              | Example                                     |
| ------------------------------------------------------ | ----------------------- | ------------------------------------------- |
| Class, interface, type, enum, React component function | PascalCase              | `UserService`, `AuthToken`, `ThemeProvider` |
| Config/singleton object constant                       | PascalCase              | `Env`, `AppConfig`                          |
| Variable, function, method, parameter                  | camelCase               | `findById`, `accessToken`                   |
| Other module-level constant (instance, utility)        | camelCase               | `graphqlClient`, `buttonVariants`           |
| File (lib, hooks, actions)                             | `kebab-name.type.ts(x)` | `theme.provider.tsx`, `auth.actions.ts`     |
| File (server actions in `_actions/`)                   | `<name>.actions.ts`     | `auth.actions.ts`, `billing.actions.ts`     |
| File (hooks in `_hooks/` or `src/hooks/`)              | `use-<name>.ts(x)`      | `use-session.ts`, `use-profile.ts`          |
| File (feature component in `_components/`)             | `kebab-name.tsx`        | `login-form.tsx`, `auth-login-page.tsx`     |
| Boolean variable or method                             | `is`/`has`/`can` prefix | `isActive`, `hasPermission`                 |

## Anti-patterns

- NEVER use `// @ts-ignore` or `// @ts-expect-error` — fix the types instead.
- NEVER use `require()` — use ES `import`.
- NEVER use relative imports going up more than one level — use `@/` alias.
