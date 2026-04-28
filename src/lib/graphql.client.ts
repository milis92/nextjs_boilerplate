import { Client, cacheExchange, fetchExchange, subscriptionExchange } from "urql"
import { createClient as createWSClient } from "graphql-ws"
import { Env } from "@/lib/env"

const wsClient =
  typeof window === "undefined"
    ? null
    : createWSClient({
        url: Env.NEXT_PUBLIC_GRAPHQL_WS_URL,
        connectionParams: () => ({}),
        on: {
          error: (err) =>
            console.error("[graphql-ws] subscription socket error", err),
          closed: (event) =>
            console.warn("[graphql-ws] subscription socket closed", event),
        },
      })

export const graphqlClient = new Client({
  url: Env.NEXT_PUBLIC_GRAPHQL_URL,
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
