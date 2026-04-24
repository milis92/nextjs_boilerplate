"use client"

import createClient from "openapi-fetch"
import type { paths } from "@/lib/rest/api"
import { Env } from "@/lib/env"

export const restClient = createClient<paths>({
  baseUrl: Env.NEXT_PUBLIC_REST_URL,
  credentials: "include",
})
