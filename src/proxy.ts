import { getSessionCookie } from "better-auth/cookies"
import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { Env } from "@/lib/env"
import { routing } from "./i18n/i18n-routing"

const handleI18nRouting = createMiddleware(routing)

// Optimistic route protection — UX only, NOT security.
//
// (a) This guard merely checks for the *presence* of the better-auth session
//     cookie (no fetch, no validation — the cookie may be expired or forged).
//     Real authorization is enforced by the NestJS backend on every data
//     request; this only spares unauthenticated users a flash of a protected
//     page's shell before the client redirects them.
// (b) Cross-origin caveat: the session cookie is set by the *backend's*
//     better-auth instance (NEXT_PUBLIC_AUTH_URL). On localhost (same host,
//     different ports) the browser sends it to this proxy too. In production
//     with split domains (e.g. app.example.com / api.example.com) the cookie
//     must be scoped to a shared parent domain (better-auth
//     `crossSubDomainCookies` / cookie domain config) — otherwise this guard
//     never sees it and will redirect logged-in users to the login page.

// Locale-less path prefixes that require a session cookie, e.g. "/dashboard".
const protectedPathPrefixes: string[] = []

// Consuming projects create this route; the boilerplate ships no login page.
const loginPath = "/login"

// Splits a leading locale segment ("/de/dashboard" → "/de" + "/dashboard") so
// prefixes match regardless of locale ("/dashboard" with localePrefix
// "as-needed" carries none) and the redirect can preserve the user's locale.
function splitLocalePrefix(pathname: string): {
  localePrefix: string
  pathWithoutLocale: string
} {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return { localePrefix: `/${locale}`, pathWithoutLocale: "/" }
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return {
        localePrefix: `/${locale}`,
        pathWithoutLocale: pathname.slice(locale.length + 1),
      }
    }
  }
  return { localePrefix: "", pathWithoutLocale: pathname }
}

function isProtectedPath(pathWithoutLocale: string) {
  return protectedPathPrefixes.some(
    (prefix) =>
      pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`)
  )
}

const isProd = Env.NODE_ENV === "production"

// Every backend origin the browser connects to (REST, GraphQL HTTP, GraphQL WS,
// auth). Deduped so origins shared by several URLs (REST/GraphQL HTTP/auth on
// one host locally) emit a single token each; the WS endpoint always
// contributes its own ws(s):// origin, since URL.origin keeps the scheme.
const connectOrigins = Array.from(
  new Set(
    [
      Env.NEXT_PUBLIC_REST_URL,
      Env.NEXT_PUBLIC_GRAPHQL_URL,
      Env.NEXT_PUBLIC_GRAPHQL_WS_URL,
      Env.NEXT_PUBLIC_AUTH_URL,
    ].map((url) => new URL(url).origin)
  )
)

// Production uses a per-request nonce + `strict-dynamic`: scripts we explicitly
// nonce are trusted, and anything they inject (Next.js's hydration/runtime
// scripts) is trusted transitively — so no `unsafe-inline` is needed. This is
// the only way to drop `unsafe-inline` in App Router, since the `__next_f`
// hydration scripts are inline and inherent; the tradeoff is that pages must be
// dynamically rendered. Dev keeps `unsafe-inline`/`unsafe-eval` for Turbopack
// HMR and React's eval-based error overlay.
function buildCsp(nonce: string) {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

  return [
    "default-src 'self'",
    scriptSrc,
    // `'unsafe-inline'` is intentional and load-bearing: React streams inline
    // `<style>` tags (Suspense/float styles) and Next threads only a *string*
    // nonce, which react-dom can't apply to styles — a strict `style-src` would
    // break streamed styles. Scripts, by contrast, are fully nonce'd above.
    "style-src 'self' 'unsafe-inline'",
    // Adding a remote image host needs BOTH `images.remotePatterns` in
    // next.config (the server-side optimization fetch) AND an `img-src
    // https://host` token here (the browser load). Only the optimized
    // `/_next/image` path is covered by `'self'`; a remote `<img>`,
    // `unoptimized`, or a custom loader is not.
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${connectOrigins.join(" ")}`,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Upgrade http→https subresources; only over HTTPS, so skip in dev where the
    // backend is plain http/ws on localhost.
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ")
}

export default function proxy(request: NextRequest) {
  // Optimistic auth guard (see caveats above) — runs before i18n routing.
  // Redirect responses carry no HTML, so they need no nonce/CSP handling.
  const { pathname } = request.nextUrl
  const { localePrefix, pathWithoutLocale } = splitLocalePrefix(pathname)
  if (isProtectedPath(pathWithoutLocale) && !getSessionCookie(request)) {
    const loginUrl = new URL(`${localePrefix}${loginPath}`, request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = buildCsp(nonce)

  // Set the nonce + CSP on the request so Next.js extracts the nonce during SSR
  // and stamps it onto its scripts. next-intl copies the incoming request
  // headers onto its rewrite/next response, so these propagate to the render.
  //
  // NONCE CONTRACT: this proxy is the sole producer of `x-nonce`. Next.js
  // auto-applies it to its own framework/<Script> tags, but any *raw* inline
  // <script> (e.g. next-themes' anti-FOUC script, wired via layout.tsx →
  // Providers → ThemeProvider) must receive this nonce explicitly, or
  // `strict-dynamic` silently blocks it in production.
  request.headers.set("x-nonce", nonce)
  request.headers.set("Content-Security-Policy", csp)

  const response = handleI18nRouting(request)

  // Enforce the same policy on the browser-facing response.
  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  // Object form so we can skip `next/link` prefetches: they carry no inline
  // scripts and don't need a fresh-nonce CSP or a proxy run (per the Next.js CSP
  // guide). The `source` keeps next-intl's exclusions (api/trpc/_next/_vercel/
  // dotted files); the `missing` clause drops prefetch RSC requests.
  matcher: [
    {
      source: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
