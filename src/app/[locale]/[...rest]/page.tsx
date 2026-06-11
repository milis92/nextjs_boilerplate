import { notFound } from "next/navigation"

// Catch-all for any unmatched path under a locale (e.g. `/de/typo`). Real routes
// take precedence; everything else falls through here and throws `notFound()`,
// which renders the localized `[locale]/not-found.tsx` inside the locale layout.
export default function CatchAllPage() {
  notFound()
}
