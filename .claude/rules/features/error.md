---
paths:
  - "src/app/**/error.tsx"
  - "src/app/**/global-error.tsx"
---

# Error Boundary Files

Add `"use client"` and satisfy Next.js's required prop contract — error boundaries must be Client Components.

## Conventions

- !IMPORTANT Always use `unstable_retry: () => void` as the recovery prop (added in Next.js 16.2) — it re-fetches server data and re-renders the failed segment from scratch. Use `reset: () => void` only when you explicitly need to clear error state without a server round-trip.
- Log errors in `useEffect` — wrap with `if (process.env.NODE_ENV === "development")` to avoid leaking details in production

## global-error.tsx only

- Always return `<html lang="...">` and `<body>` tags — it replaces the root layout entirely
- Always use inline styles — Tailwind class names won't apply if the stylesheet fails to load

## Examples

@.claude/rules/features/examples/error.tsx
@.claude/rules/features/examples/global-error.tsx

## Anti-patterns

- NEVER add `metadata` or `generateMetadata` exports — error boundaries are Client Components and cannot export metadata; use the React `<title>` component instead
- NEVER trigger side effects other than `useEffect` error logging inside an error boundary
