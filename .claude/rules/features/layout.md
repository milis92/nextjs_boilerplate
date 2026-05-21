---
paths:
  - "src/app/**/layout.tsx"
---

## Layout Files

`layout.tsx` files wrap a route group's pages with shared shell UI or context providers.

### Structure

A layout wraps `children` with structural UI or providers. The root locale layout is async and handles i18n setup; nested layouts are synchronous unless a provider genuinely requires async data.

```tsx
/** Root locale layout — validates locale, sets up i18n context, and wraps with providers. */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // validate locale, set up i18n, wrap with providers
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
/** Shell layout for a route group — centres content on the page. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      {children}
    </main>
  )
}
```

### Rules

- Accept `{ children: React.ReactNode }` as the only prop
- No data fetching in domain layout files — if a provider needs async data, extract it into a Server Component in `_components/` and import it here
- Always a default export (required by Next.js)
- Only the root layout (`app/[locale]/layout.tsx`) returns `<html>` and `<body>` tags — nested layouts return only `children`
- Export `generateStaticParams()` from locale layouts to pre-generate all supported locales at build time
- For i18n layouts: validate the locale with `hasLocale()`, call `setRequestLocale()`, and wrap with `NextIntlClientProvider`

### Anti-patterns

- NEVER fetch data directly in a domain layout — use a Server Component in `_components/` as the data loader and import it into the layout
- NEVER add per-page logic to a layout — layouts apply to every child route in the group
- NEVER use named export — `layout.tsx` requires a default export
