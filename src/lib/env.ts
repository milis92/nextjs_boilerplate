import {createEnv} from "@t3-oss/env-nextjs"
import * as z from "zod"

export const Env = createEnv({
    /**
     * Shared variables for both client & server, injected by the build tools,
     * that do not require the NEXT_PUBLIC_ prefix
     */
    shared: {
        NODE_ENV: z.enum(["test", "development", "production"]).optional(),
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
        NEXT_PUBLIC_APP_URL: z.url().optional(),
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
