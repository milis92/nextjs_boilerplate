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

import robots from "./robots"

describe("robots", () => {
  test("allows all user agents", () => {
    const result = robots()
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" })
  })

  test("includes sitemap URL when APP_URL is set", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://example.com/sitemap.xml")
  })
})

describe("robots with no APP_URL", () => {
  test("omits sitemap field", async () => {
    vi.doMock("@/lib/env", () => ({
      Env: {
        NEXT_PUBLIC_APP_NAME: "Test App",
        NEXT_PUBLIC_APP_URL: undefined,
        NEXT_PUBLIC_REST_URL: "http://localhost:3001",
        NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:3001/graphql",
        NEXT_PUBLIC_GRAPHQL_WS_URL: "ws://localhost:3001/graphql",
        NEXT_PUBLIC_AUTH_URL: "http://localhost:3001/api/auth",
        NODE_ENV: "test",
      },
    }))
    vi.resetModules()
    const { default: robotsFn } = await import("./robots")
    const result = robotsFn()
    expect(result.sitemap).toBeUndefined()
    vi.doUnmock("@/lib/env")
  })
})
