import { describe, expect, it } from "vitest"

import {
  cheapestRail,
  getRail,
  isRailId,
  quoteRails,
  railFee,
} from "@/lib/payment-rails"

describe("railFee", () => {
  it("prices the designed rails against $69", () => {
    const fees = Object.fromEntries(
      quoteRails(69).map((quote) => [quote.id, quote.fee]),
    )

    expect(fees).toEqual({
      crypto: 0.3,
      npp: 0.34,
      visa: 0.36,
      eftpos: 0.38,
      swift: 10,
    })
  })

  it("scales proportional rails with the amount, but not the flat wire fee", () => {
    const small = quoteRails(69)
    const large = quoteRails(5000)

    const crypto = (qs: typeof small) => qs.find((q) => q.id === "crypto")!.fee
    const swift = (qs: typeof small) => qs.find((q) => q.id === "swift")!.fee

    expect(crypto(large)).toBeGreaterThan(crypto(small))
    expect(swift(large)).toBe(swift(small))
  })

  it("rounds to cents", () => {
    const rail = getRail("crypto")!
    // 33.33 * 0.0043 = 0.1433... — must not leak sub-cent precision.
    expect(railFee(rail, 33.33)).toBe(0.14)
  })
})

describe("quoteRails", () => {
  it("flags exactly one cheapest rail", () => {
    const cheapest = quoteRails(69).filter((quote) => quote.isCheapest)

    expect(cheapest).toHaveLength(1)
    expect(cheapest[0].id).toBe("crypto")
  })

  // On a tiny payment every proportional rail rounds to $0.00, so the flag has
  // to survive a tie rather than landing on the slow wire by accident.
  it("keeps the cheapest flag off SWIFT when proportional fees tie at zero", () => {
    expect(cheapestRail(1).id).toBe("crypto")
  })

  it("makes SWIFT the cheapest only when the amount is large enough", () => {
    expect(cheapestRail(1_000_000).id).toBe("swift")
  })
})

describe("isRailId", () => {
  it("accepts known rails and rejects anything else", () => {
    expect(isRailId("npp")).toBe(true)
    expect(isRailId("paypal")).toBe(false)
    expect(isRailId(undefined)).toBe(false)
  })
})
