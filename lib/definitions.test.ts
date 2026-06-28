import { describe, it, expect } from "vitest"
import { extractAccountId } from "@/lib/definitions"

describe("extractAccountId", () => {
  it("reads accounts.id", () => {
    expect(extractAccountId({ accounts: { id: "acc_123" } })).toBe("acc_123")
  })
  it("returns undefined when accounts is missing", () => {
    expect(extractAccountId({ email: "a@b.c" })).toBeUndefined()
  })
  it("returns undefined for blank id", () => {
    expect(extractAccountId({ accounts: { id: "" } })).toBeUndefined()
  })
  it("returns undefined for non-object input", () => {
    expect(extractAccountId(null)).toBeUndefined()
    expect(extractAccountId("nope")).toBeUndefined()
  })
})
