import { utils } from "../src/index"
import { describe, expect, it } from "vitest"

describe("encode & decode domains", () => {
  it("encodeDomain should return encoded domain name", async () => {
    const encoded = utils.encodeDomain("test.stark")
    expect(encoded).toBe(BigInt(45424530358395n))
  })

  it("encodeDomain should fail because domain not ending with .stark", async () => {
    expect(() => utils.encodeDomain("test")).toThrowError(
      "Domain is not a stark domain",
    )
    expect(() => utils.encodeDomain("test.st")).toThrowError(
      "Domain is not a stark domain",
    )
  })
})
