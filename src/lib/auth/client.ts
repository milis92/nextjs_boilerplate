import { createAuthClient } from "better-auth/react"
import { Env } from "@/lib/env"

// Auth requests send the session cookie cross origin: with a split-origin
// production backend it only flows if the backend sets `SameSite=None; Secure`
// and allows CORS credentials for this exact origin. Same-origin and localhost
// setups are unaffected.
export const authClient = createAuthClient({
  baseURL: Env.NEXT_PUBLIC_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
