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

/** Renders when an unhandled error is thrown in the root layout. */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => unstable_retry()}>Try again</button>
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

### `unstable_retry` vs `reset`

`unstable_retry()` (added in Next.js 16.2) is the primary recovery function: it re-fetches and re-renders the failed segment. Prefer it for "Try again" buttons.

`reset()` is a secondary escape hatch that clears error state without re-fetching. Use it only when you explicitly want to avoid a re-fetch.

### Anti-patterns

- NEVER omit `'use client'` — Next.js will throw a build-time error because error boundaries must be Client Components
- NEVER omit `unstable_retry` — it is the primary recovery prop in Next.js 16.2 and the correct choice for "Try again" buttons
- NEVER fetch data for the fallback UI inside an error boundary — keep it minimal; schedule side effects (e.g. error logging) in `useEffect`
- NEVER use named export — `error.tsx` requires a default export
- NEVER omit `<html>` and `<body>` from `global-error.tsx` — it replaces the root layout and the page will be malformed without them
