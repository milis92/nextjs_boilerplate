---
paths:
  - "src/app/**/page.tsx"
---

## Page Files

`page.tsx` files are thin routing entry points. They pass route params to a feature component — nothing else.

### Structure

A page file does exactly one thing: import the root component from `_module/components/` and forward params.

```tsx
import { AuthLoginPage } from "./_module/components/auth-login-page";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
};

/** Entry point for the login route — delegates all rendering to AuthLoginPage. */
export default async function Page({ params, searchParams }: Props) {
  return (
    <AuthLoginPage
      params={await params}
      searchParams={await searchParams}
    />
  );
}
```

### Rules

- One root component import, one JSX element — `metadata` or `generateMetadata` exports are the only permitted addition
- No business logic, no data fetching, no conditional rendering
- Always a default export (required by Next.js)
- `params` and `searchParams` are always `Promise<…>` in Next.js 15 and later

### Anti-patterns

- NEVER add conditional rendering or logic in `page.tsx`
- NEVER call server actions or data fetching functions directly in `page.tsx`
- NEVER define components inline inside `page.tsx`
- NEVER use named export — `page.tsx` requires a default export
