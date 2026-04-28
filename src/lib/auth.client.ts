import { createAuthClient } from "better-auth/react"
import { Env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: Env.NEXT_PUBLIC_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
