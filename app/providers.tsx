"use client"

import { Provider as UrqlProvider } from "urql"
import { ThemeProvider } from "@/components/theme-provider"
import { graphqlClient } from "@/lib/graphql-client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UrqlProvider value={graphqlClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </UrqlProvider>
  )
}
