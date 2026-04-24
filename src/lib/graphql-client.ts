"use client"

import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
  type Exchange,
} from "urql"
import { createClient as createWSClient } from "graphql-ws"
import { Env } from "@/lib/env"

// null during SSR/RSC; subscriptions are only constructed on the client.
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

const exchanges: Exchange[] = [cacheExchange, fetchExchange]

if (wsClient) {
  const client = wsClient
  exchanges.push(
    subscriptionExchange({
      forwardSubscription: (request) => ({
        subscribe: (sink) => ({
          unsubscribe: client.subscribe(
            { ...request, query: request.query ?? "" },
            sink
          ),
        }),
      }),
    })
  )
}

export const graphqlClient = new Client({
  url: Env.NEXT_PUBLIC_GRAPHQL_URL,
  fetchOptions: { credentials: "include" },
  exchanges,
})
