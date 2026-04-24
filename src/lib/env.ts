import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const Env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
  },
  shared: {
    NODE_ENV: z.enum(["test", "development", "production"]).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
})
