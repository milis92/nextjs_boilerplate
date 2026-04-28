---
paths:
  - "src/app/**/layout.tsx"
---

## Layout Files

`layout.tsx` files wrap a route group's pages with shared shell UI or context providers.

### Structure

A layout wraps `children` with structural UI or providers. Keep it synchronous unless a provider genuinely requires async data.

```tsx
/** Shell layout for the auth route group — centres content on the page. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      {children}
    </main>
  );
}
```

### Rules

- Accept `{ children: React.ReactNode }` as the only prop
- No data fetching in domain layout files — if a provider needs async data, extract it into a Server Component in `_module/components/` and import it here
- Always a default export (required by Next.js)

### Anti-patterns

- NEVER fetch data directly in a domain layout — use a Server Component in `_module/components/` as the data loader and import it into the layout
- NEVER add per-page logic to a layout — layouts apply to every child route in the group
- NEVER use named export — `layout.tsx` requires a default export
