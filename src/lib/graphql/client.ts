import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql"
import { createClient as createWSClient } from "graphql-ws"
import { Env } from "@/lib/env"

const wsClient =
  typeof window === "undefined"
    ? null
    : createWSClient({
        url: Env.NEXT_PUBLIC_GRAPHQL_WS_URL,
        // Empty by design: subscriptions currently authenticate via the session
        // cookie, like queries. But a cross-origin WS upgrade only carries
        // cookies when they are `SameSite=None; Secure` (and some proxies strip
        // them), so for split-origin prod backends pass an auth token here (read
        // from the better-auth session) instead of relying on the cookie.
        connectionParams: () => ({}),
        on: {
          error: (err) =>
            console.error("[graphql-ws] subscription socket error", err),
          closed: (event) =>
            console.warn("[graphql-ws] subscription socket closed", event),
        },
      })

// Factory, not a singleton: a module-level Client would be shared across all
// SSR requests in one server process, and its document cache would leak one
// user's responses into another's render. Create one client per React tree
// instead (see providers.tsx: `useState(() => createGraphqlClient())`).
export function createGraphqlClient() {
  return new Client({
    url: Env.NEXT_PUBLIC_GRAPHQL_URL,
    // Same cross-origin cookie constraint as the WS client above: a
    // split-origin production backend must set `SameSite=None; Secure` and
    // allow CORS credentials for this exact origin, or the session cookie is
    // dropped. Same-origin and localhost setups are unaffected.
    fetchOptions: { credentials: "include" },
    exchanges: [
      cacheExchange,
      fetchExchange,
      ...(wsClient
        ? [
            subscriptionExchange({
              forwardSubscription(request) {
                const input = { ...request, query: request.query ?? "" }
                return {
                  subscribe(sink) {
                    const unsubscribe = wsClient.subscribe(input, sink)
                    return { unsubscribe }
                  },
                }
              },
            }),
          ]
        : []),
    ],
  })
}
