import { describe, it, expect } from "vitest"
import { restClient } from "./rest-client"

describe("restClient", () => {
  it("is exported and defined", () => {
    expect(restClient).toBeDefined()
  })

  it("exposes typed HTTP methods", () => {
    expect(typeof restClient.GET).toBe("function")
    expect(typeof restClient.POST).toBe("function")
    expect(typeof restClient.PUT).toBe("function")
    expect(typeof restClient.DELETE).toBe("function")
    expect(typeof restClient.PATCH).toBe("function")
  })
})
