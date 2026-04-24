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

const httpUrl = `${Env.NEXT_PUBLIC_API_URL}/graphql`

function toWsUrl(url: string): string {
  const parsed = new URL(url)
  parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:"
  return parsed.toString()
}

// null during SSR/RSC; subscriptions are only constructed on the client.
const wsClient =
  typeof window === "undefined"
    ? null
    : createWSClient({
        url: toWsUrl(httpUrl),
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
  url: httpUrl,
  fetchOptions: { credentials: "include" },
  exchanges,
})
