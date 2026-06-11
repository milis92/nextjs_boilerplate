import Link from "next/link"

// Renders for `notFound()` thrown in the locale layout itself (e.g. an unknown
// locale, which bubbles above `[locale]`) and for non-localized unmatched paths.
// It sits outside the locale layout, so — like global-error.tsx — it supplies
// its own <html>/<body> and inline styles and uses a fixed language. Localized
// 404s for known locales come from [locale]/not-found.tsx via the catch-all.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100svh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Page not found
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#71717a", margin: 0 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#18181b",
            color: "#fafafa",
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </body>
    </html>
  )
}
