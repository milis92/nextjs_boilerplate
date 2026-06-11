import type { Metadata, Viewport } from "next"
import { hasLocale } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Geist } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import "@/styles/globals.css"
import { Providers } from "@/components/providers/providers"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/components/ui/cn"
import { Env } from "@/lib/env"
import { languageAlternates, localePath } from "@/i18n/i18n-alternates"
import { routing } from "@/i18n/i18n-routing"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

// Intentionally NO `generateStaticParams` here: the nonce CSP (src/proxy.ts)
// forces every `[locale]` route to render dynamically — `headers()` below —
// so pre-generating locale params is inert and would only suggest SSG that
// can't happen. Re-add it only if the project switches to the static CSP
// variant (see README "CSP strategy" decision record).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return {}
  }

  // Primes next-intl's request-scoped locale cache so this function doesn't
  // independently fall back to `headers()`. NOTE: this no longer buys static
  // rendering — the layout reads the per-request CSP nonce via `headers()` (see
  // src/proxy.ts), which makes every `[locale]` route dynamic by design. A
  // nonce-based CSP and SSG are mutually exclusive; this call only keeps
  // `generateMetadata` from being a *separate* dynamic-usage trigger.
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: "Metadata" })
  const title = Env.NEXT_PUBLIC_APP_NAME
  const description = t("description")

  // Relative paths resolved against `metadataBase` into absolute
  // canonical/hreflang URLs. This covers the home route; nested routes should
  // override `alternates` in their own `generateMetadata`.
  return {
    metadataBase: new URL(Env.NEXT_PUBLIC_APP_URL),
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: {
      canonical: localePath(locale),
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: title,
      locale,
      title,
      description,
      url: localePath(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // Per-request CSP nonce minted by the proxy (src/proxy.ts), forwarded to
  // next-themes so its inline anti-FOUC script passes `script-src 'nonce-…'
  // 'strict-dynamic'`. Reading headers() here is what makes every `[locale]`
  // route dynamic — unavoidable with a nonce CSP. Any future inline-script
  // library must also receive this nonce.
  const requestHeaders = await headers()
  const nonce = requestHeaders.get("x-nonce") ?? undefined

  // NONCE CONTRACT: the proxy is the *sole* producer of `x-nonce`. The only
  // requests that legitimately lack it are the prefetches the proxy matcher
  // deliberately skips (`next/link` RSC prefetches and browser
  // `purpose: prefetch` loads — see src/proxy.ts and tests/prefetch.e2e.ts);
  // those carry no inline scripts. Any HTML *document* request without a nonce
  // means the proxy didn't run (matcher drift, new route outside the matcher,
  // proxy removed) and production's `strict-dynamic` CSP silently blocks
  // un-nonced inline scripts (e.g. next-themes' anti-FOUC script → broken
  // theming). Fail loud in server logs; a throw would instead 500 every
  // affected page — including error pages, which render through this layout.
  //
  // `next-router-prefetch` itself is unreadable here: Next strips Flight
  // headers (`rsc`, `next-router-prefetch`, …) from `headers()` (see
  // next/dist/server/async-storage/request-store.js getHeaders). So detect the
  // inverse: flag only browser HTML navigations (`sec-fetch-dest: document` /
  // `accept: text/html`) — RSC/prefetch fetches send `accept: */*` and a
  // non-document fetch dest. Dev is intentionally silent: its CSP keeps
  // `unsafe-inline`, so a missing nonce breaks nothing there.
  if (nonce === undefined && Env.NODE_ENV === "production") {
    const isHtmlDocumentRequest =
      requestHeaders.get("sec-fetch-dest") === "document" ||
      (requestHeaders.get("accept") ?? "").includes("text/html")
    const isBrowserPrefetch =
      requestHeaders.get("purpose") === "prefetch" ||
      (requestHeaders.get("sec-purpose") ?? "").includes("prefetch")
    if (isHtmlDocumentRequest && !isBrowserPrefetch) {
      console.error(
        `[csp] x-nonce missing on an HTML request (locale "${locale}") — ` +
          "src/proxy.ts did not run for it (check the matcher). Either this " +
          "page shipped without its CSP entirely, or a CSP applied elsewhere " +
          "is silently blocking its inline scripts."
      )
    }
  }

  // Only the namespaces consumed by Client Components ("use client" files).
  // Passing the subset explicitly keeps the rest of the catalog out of every
  // page's RSC payload — without a `messages` prop, NextIntlClientProvider
  // inherits the FULL catalog. Extend this object when a new Client Component
  // starts translating from a new namespace.
  const messages = await getMessages()
  const clientMessages = { Theme: messages.Theme, Error: messages.Error }

  return (
    // `suppressHydrationWarning` is element-scoped: it silences ALL `<html>`
    // hydration mismatches (incl. a wrong `lang`), not just the next-themes
    // class/style mutation it's there for. Both `lang` and the provider locale
    // derive from the validated `params.locale`, so keep it that way.
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", geist.variable)}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <Providers nonce={nonce}>
            <ThemeToggle />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
