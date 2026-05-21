---
paths:
  - "src/app/**/layout.tsx"
---

# Layout Files

Wrap route children with structural UI or providers — keep data fetching out of layout files.

## Conventions

- Only accept `{ children: React.ReactNode }` in domain (nested) layouts — never add additional props
- Never fetch data in layout files — if a provider needs async data, extract it into a Server Component in `_components/` and import it here
- Make nested layouts synchronous unless a provider genuinely requires async data
- Return only `children` from nested layouts — only the root locale layout returns `<html>` and `<body>`
- Never add per-page logic to a layout — layouts apply to every child route in the group

## Root Locale Layout

- !IMPORTANT `params` is always `Promise<{ locale: string }>` — always await it before use
- Add `suppressHydrationWarning` to `<html>` to prevent theme-switching hydration mismatches
- Export `generateStaticParams()` to pre-generate all supported locales at build time

## Examples

<!-- locale-layout.tsx: root locale layout with next-intl, params awaiting, and generateStaticParams -->
<!-- shell-layout.tsx: minimal nested layout returning only children wrapped in structural HTML -->

@.claude/rules/features/examples/locale-layout.tsx
@.claude/rules/features/examples/shell-layout.tsx
