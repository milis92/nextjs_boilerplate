import { describe, expect, test, vi } from "vitest"

vi.mock("@/lib/env", () => ({
  Env: {
    NEXT_PUBLIC_APP_NAME: "Test App",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_REST_URL: "http://localhost:3001",
    NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
    NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
    NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
    NODE_ENV: "test",
  },
}))

// next/og uses Edge APIs — mock to prevent Node import errors
vi.mock("next/og", () => ({
  ImageResponse: class ImageResponse {},
}))

import { alt, contentType, runtime, size } from "./opengraph-image"

describe("opengraph-image static exports", () => {
  test("runtime is edge", () => {
    expect(runtime).toBe("edge")
  })

  test("alt matches app name from env", () => {
    expect(alt).toBe("Test App")
  })

  test("size is 1200x630", () => {
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  test("contentType is image/png", () => {
    expect(contentType).toBe("image/png")
  })
})
