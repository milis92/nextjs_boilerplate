import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { Env } from "@/lib/env"

const isProd = Env.NODE_ENV === "production"

// The Content-Security-Policy is set per-request in `src/proxy.ts` because it
// needs a fresh nonce on every response (`script-src 'nonce-…' 'strict-dynamic'`).
// Static headers that don't depend on the request stay here.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
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
  logging: {
    browserToTerminal: "warn",
  },
  devIndicators: {
    position: "bottom-right",
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable in dev too so the compiler's transforms are exercised locally and in
  // CI, not first encountered in the production build.
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

const nextConfig = createNextIntlPlugin("./src/i18n/i18n.ts")(baseConfig)

export default nextConfig
