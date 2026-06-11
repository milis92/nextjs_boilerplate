"use client"

import { useState } from "react"
import { Provider as UrqlProvider } from "urql"
import { ThemeProvider } from "./theme.provider"
import { createGraphqlClient } from "@/lib/graphql/client"

// Data is fetched CLIENT-SIDE through these providers (urql + openapi-fetch +
// better-auth all run in the browser). There is intentionally no server-side
// data layer yet, so RSC streaming / server data fetching is unused. To fetch
// authenticated data in Server Components, add a parallel server client that
// reads and forwards `cookies()` — the clients here won't transfer.
export function Providers({
  children,
  nonce,
}: {
  children: React.ReactNode
  nonce?: string
}) {
  // One urql client per React tree so SSR renders never share a document
  // cache across requests/users.
  const [graphqlClient] = useState(() => createGraphqlClient())

  return (
    <UrqlProvider value={graphqlClient}>
      <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
    </UrqlProvider>
  )
}
