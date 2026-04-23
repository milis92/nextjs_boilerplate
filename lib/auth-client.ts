import { createAuthClient } from "better-auth/react"
import { Env } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: `${Env.NEXT_PUBLIC_API_URL}/api/auth`,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
