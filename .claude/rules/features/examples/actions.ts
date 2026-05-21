"use server"

import { z } from "zod"
import { restClient } from "@/lib/rest/client"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function login(
  input: z.infer<typeof loginSchema>
): Promise<
  { success: true; token: string } | { success: false; error: string }
> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  const { data, error } = await restClient.POST("/auth/login", {
    body: parsed.data,
  })
  if (error) {
    return { success: false, error: String(error) }
  }
  return { success: true, token: data.token }
}
