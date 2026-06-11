import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const Env = createEnv({
  /**
   * Shared variables for both client & server, injected by the build tools,
   * that do not require the NEXT_PUBLIC_ prefix
   */
  shared: {
    // Fail closed: if NODE_ENV is somehow unset, default to "production" so
    // security controls keyed off it (e.g. the strict CSP in proxy.ts) stay strict.
    NODE_ENV: z
      .enum(["test", "development", "production"])
      .default("production"),
  },

  /**
   * Server Environment variables - not available on the client (browser).
   * Throws if you access these variables on the client.
   */
  server: {},

  /**
   * Client Environment variables - available on the client and server (browser and server).
   * Throws type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    // Anchors metadataBase, OG-image origin, canonical/hreflang, robots &
    // sitemap. NEXT_PUBLIC_* values are INLINED AT BUILD TIME, not read per
    // request — so this must be set for each environment's build. Promoting one
    // build artifact across envs would emit this build's origin everywhere.
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_REST_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_WS_URL: z.url(),
    NEXT_PUBLIC_AUTH_URL: z.url(),
  },

  /**
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * Throws type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_REST_URL: process.env.NEXT_PUBLIC_REST_URL,
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_GRAPHQL_WS_URL: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
  },
})
