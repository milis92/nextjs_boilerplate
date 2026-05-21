---
paths:
  - "src/**/*.{ts,tsx}"
---

# Code Style

Follow these TypeScript, import, and naming rules in every source file — they override language defaults and differ from what Claude would write by default.

## Type Discipline

- NEVER use `any`. Use `unknown` at external boundaries (parsed JSON, third-party callbacks) and narrow with type
  guards.
- NEVER use type assertions (`as X`) except when receiving data from an external API where the shape is verified out-of-band.
  Leave a comment explaining why.
- Use `type` for everything — unions, intersections, mapped types, and object shapes.
- !IMPORTANT NEVER use `// @ts-ignore` or `// @ts-expect-error` — fix the types instead.

## Import Style

- Use `import type` for type-only imports; use inline `type` when the same module exports values and types.
- Use the `@/` path alias for any import that crosses a route boundary — anything in `src/lib/`, `src/components/`, a parent group's `_components/`/`_hooks/`/`_actions/`, or another feature entirely.
- Use relative `./` imports within the same co-located folder (e.g. `page.tsx` → `./_components/`, or files within the same `_components/` tree).
- Relative paths may go up at most one level within co-located directories (e.g. `../_hooks/use-foo` from `_components/`). Any path that would leave the route's co-located directories uses `@/` instead.

## Naming Conventions

| Thing                                                  | Convention              | Example                                     |
|--------------------------------------------------------|-------------------------|---------------------------------------------|
| Class, interface, type, enum, React component function | PascalCase              | `UserService`, `AuthToken`, `ThemeProvider` |
| Config/singleton object constant                       | PascalCase              | `Env`, `AppConfig`                          |
| Variable, function, method, parameter                  | camelCase               | `findById`, `accessToken`                   |
| Other module-level constant (instance, utility)        | camelCase               | `graphqlClient`, `buttonVariants`           |
| File (lib, hooks, actions)                             | `kebab-name.type.ts(x)` | `theme.provider.tsx`, `auth.actions.ts`     |
| File (server actions in `_actions/`)                   | `<name>.actions.ts`     | `auth.actions.ts`, `billing.actions.ts`     |
| File (hooks in `_hooks/` or `src/hooks/`)              | `use-<name>.ts(x)`      | `use-session.ts`, `use-profile.ts`          |
| File (feature component in `_components/`)             | `kebab-name.tsx`        | `login-form.tsx`, `auth-login-page.tsx`     |
| Boolean variable or method                             | `is`/`has`/`can` prefix | `isActive`, `hasPermission`                 |

Use named exports everywhere. Default exports are only permitted in Next.js reserved files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
