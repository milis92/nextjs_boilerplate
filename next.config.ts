import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import "./src/lib/env"

const isProd = process.env.NODE_ENV === "production"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const apiOrigin = new URL(apiUrl).origin
const wsOrigin = apiOrigin.replace(/^http/, "ws")

// Next.js dev (Turbopack/HMR) requires `unsafe-inline` and `unsafe-eval`.
// Production drops `unsafe-eval`; further nonce-based hardening is a TODO
// once a nonce middleware is added.
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} ${wsOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
]

const baseConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Keep the development environment fast
  reactCompiler: isProd,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

const nextConfig = createNextIntlPlugin("./src/lib/i18n.ts")(baseConfig)

export default nextConfig
