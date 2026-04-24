import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const Env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_REST_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_URL: z.url(),
    NEXT_PUBLIC_GRAPHQL_WS_URL: z.url(),
    NEXT_PUBLIC_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
  },
  shared: {
    NODE_ENV: z.enum(["test", "development", "production"]).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_REST_URL: process.env.NEXT_PUBLIC_REST_URL,
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    NEXT_PUBLIC_GRAPHQL_WS_URL: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
  },
})
