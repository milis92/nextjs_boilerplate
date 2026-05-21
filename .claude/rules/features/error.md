---
paths:
  - "src/app/**/error.tsx"
  - "src/app/**/global-error.tsx"
---

## Error Boundary Files

Next.js requires `error.tsx` and `global-error.tsx` to be Client Components that satisfy a specific prop contract.

### Required structure — `error.tsx`

```tsx
"use client"

import { useEffect } from "react"

/** Renders when an unhandled error is thrown in the route segment. */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => unstable_retry()}>Try again</button>
    </div>
  )
}
```

### Required structure — `global-error.tsx`

`global-error.tsx` replaces the root layout when active, so it must include `<html>` and `<body>` tags.

```tsx
"use client"

import { useEffect } from "react"

/** Renders when an unhandled error is thrown in the root layout. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

### Rules

- Always add `'use client'` — Next.js requires error boundaries to be Client Components
- Always accept `{ error: Error & { digest?: string }; unstable_retry: () => void }` as props
- Always a default export (required by Next.js)
- Never make the component async — React does not support async function components as error boundary fallbacks
- For `global-error.tsx` only: always return `<html>` and `<body>` tags — it replaces the root layout entirely
- Use inline styles (not CSS class names) in `global-error.tsx` — stylesheets may fail to load when this boundary activates
- Log errors in `useEffect` only in development to avoid leaking implementation details in production: wrap with `if (process.env.NODE_ENV === "development")`

### `unstable_retry` vs `reset`

Both are valid recovery props. Choose based on what you need:

- `unstable_retry()` (added in Next.js 16.2): re-fetches server data and re-renders the failed segment from scratch. Prefer for "Try again" buttons where fresh data is needed.
- `reset()`: clears error state client-side without re-fetching. Use when you want to dismiss the error without a server round-trip.

Accept both in your component props; use whichever matches the UX intent.

### Anti-patterns

- NEVER omit `'use client'` — Next.js will throw a build-time error because error boundaries must be Client Components
- NEVER omit a recovery function — always include at least one of `reset` or `unstable_retry` so users can recover
- NEVER fetch data for the fallback UI inside an error boundary — keep it minimal; schedule side effects (e.g. error logging) in `useEffect`
- NEVER use named export — `error.tsx` requires a default export
- NEVER omit `<html>` and `<body>` from `global-error.tsx` — it replaces the root layout and the page will be malformed without them
