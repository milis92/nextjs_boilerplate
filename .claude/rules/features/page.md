---
paths:
  - "src/app/**/page.tsx"
---

## Page Files

`page.tsx` files are thin routing entry points. They pass route params to a feature component — nothing else.

### Structure

A page file does exactly one thing: import the root component from `_components/` and forward params.

```tsx
// Route that uses params and searchParams
import { AuthLoginPage } from "./_components/auth-login-page"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}

/** Entry point for the login route — delegates all rendering to AuthLoginPage. */
export default async function Page({ params, searchParams }: Props) {
  return (
    <AuthLoginPage params={await params} searchParams={await searchParams} />
  )
}

// Route that doesn't use either (simpler form)
import { HomePage } from "./_components/home-page"

export default function Page() {
  return <HomePage />
}
```

### Rules

- One root component import, one JSX element — `metadata` or `generateMetadata` exports are the only permitted addition
- No business logic, no data fetching, no conditional rendering
- Always a default export (required by Next.js)
- `params` and `searchParams` are always `Promise<…>` in Next.js 15 and later
- Pages are only `async` when they need to await `params` or `searchParams`; omit both when the route doesn't use them

### Anti-patterns

- NEVER add conditional rendering or logic in `page.tsx`
- NEVER call server actions or data fetching functions directly in `page.tsx` — delegate to the root component in `_components/`
- NEVER define components inline inside `page.tsx`
- NEVER use named export — `page.tsx` requires a default export
