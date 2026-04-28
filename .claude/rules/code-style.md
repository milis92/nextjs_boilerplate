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

## Import Style

- Use `import type` for type-only imports; use inline `type` when the same module exports values and types.
- Use the `@/` path alias for all imports from `src/` — never use relative paths that go up more than one directory
  level.

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

| Thing                                                  | Convention                  | Example                                     |
|--------------------------------------------------------|-----------------------------|---------------------------------------------|
| Class, interface, type, enum, React component function | PascalCase                  | `UserService`, `AuthToken`, `ThemeProvider` |
| Config/singleton object constant                       | PascalCase                  | `Env`, `AppConfig`                          |
| Variable, function, method, parameter                  | camelCase                   | `findById`, `accessToken`                   |
| Other module-level constant (instance, utility)        | camelCase                   | `graphqlClient`, `buttonVariants`           |
| File                                                   | `[kebab-name].[type].ts(x)` | `theme.provider.tsx`, `auth.client.ts`      |
| Boolean variable or method                             | `is`/`has`/`can` prefix     | `isActive`, `hasPermission`                 |

## Anti-patterns

- NEVER use `// @ts-ignore` or `// @ts-expect-error` — fix the types instead.
- NEVER use `require()` — use ES `import`.
- NEVER use relative imports going up more than one level — use `@/` alias.
