import createClient from "openapi-fetch"
import type { paths } from "./generated/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_REST_URL,
  // Cookies cross origin: with a split-origin production backend, the session
  // cookie is only sent if the backend sets `SameSite=None; Secure` and its
  // CORS config allows credentials for this exact origin. Same-origin and
  // localhost setups are unaffected.
  credentials: "include",
})
