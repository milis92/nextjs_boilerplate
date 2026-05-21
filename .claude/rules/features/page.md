---
paths:
  - "src/app/**/page.tsx"
---

# Page Files

Import exactly one root component from `_components/` and forward params to it — nothing else.

## Examples

@.claude/rules/features/examples/page-with-params.tsx
@.claude/rules/features/examples/page-without-params.tsx

## Conventions

- `metadata` and `generateMetadata` exports are the only additions permitted beyond the default export
- !IMPORTANT Never add business logic, data fetching, or conditional rendering — delegate everything to the root component in `_components/`
- Always type `params` and `searchParams` as `Promise<…>` and await them before passing to components
