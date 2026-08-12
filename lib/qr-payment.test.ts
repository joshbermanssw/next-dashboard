import { describe, expect, it } from "vitest"

import {
  buildPaymentUrl,
  parseAmount,
  parsePaymentUrl,
} from "@/lib/qr-payment"

const ORIGIN = "https://dosshpay.example"

describe("buildPaymentUrl", () => {
  it("round-trips an account and amount", () => {
    const url = buildPaymentUrl(ORIGIN, { accountId: "crypto", amount: 69 })

    expect(parsePaymentUrl(url, ORIGIN)).toEqual({
      accountId: "crypto",
      amount: 69,
    })
  })

  it("round-trips an open request with no amount", () => {
    const url = buildPaymentUrl(ORIGIN, { accountId: "crypto", amount: null })

    expect(url).not.toContain("amt")
    expect(parsePaymentUrl(url, ORIGIN)).toEqual({
      accountId: "crypto",
      amount: null,
    })
  })

  it("escapes the account id rather than letting it add path segments", () => {
    const url = buildPaymentUrl(ORIGIN, { accountId: "a/../b", amount: null })

    expect(url).toBe(`${ORIGIN}/qr/pay/a%2F..%2Fb`)
    // ...and the parser refuses it on the way back in, so an id that smuggles a
    // slash can never resolve to a different path than the one it encodes.
    expect(parsePaymentUrl(url, ORIGIN)).toBeNull()
  })
})

describe("parsePaymentUrl", () => {
  it("rejects a QR pointing at someone else's origin", () => {
    const url = buildPaymentUrl("https://evil.example", {
      accountId: "crypto",
      amount: 69,
    })

    expect(parsePaymentUrl(url, ORIGIN)).toBeNull()
  })

  it("rejects our own origin on a different path", () => {
    expect(parsePaymentUrl(`${ORIGIN}/account/crypto`, ORIGIN)).toBeNull()
  })

  it("rejects a bare wifi/text QR", () => {
    expect(parsePaymentUrl("WIFI:S=cafe;T=WPA;P=hunter2;;", ORIGIN)).toBeNull()
  })

  it("rejects an empty account id", () => {
    expect(parsePaymentUrl(`${ORIGIN}/qr/pay/`, ORIGIN)).toBeNull()
  })

  // Nothing moves until the payer confirms a figure on screen, so a junk amount
  // degrades to "payer names it" rather than failing an otherwise valid scan.
  it("keeps the scan but drops an unusable amount", () => {
    expect(parsePaymentUrl(`${ORIGIN}/qr/pay/crypto?amt=-5`, ORIGIN)).toEqual({
      accountId: "crypto",
      amount: null,
    })
    expect(parsePaymentUrl(`${ORIGIN}/qr/pay/crypto?amt=abc`, ORIGIN)).toEqual({
      accountId: "crypto",
      amount: null,
    })
  })
})

describe("parseAmount", () => {
  it("reads a usable amount to cents", () => {
    expect(parseAmount("69.005")).toBe(69.01)
    expect(parseAmount("0.50")).toBe(0.5)
  })

  it("returns null for absent, empty, or unusable values", () => {
    for (const raw of [null, undefined, "", "  ", "0", "-1", "abc", "1e30"]) {
      expect(parseAmount(raw)).toBeNull()
    }
  })
})
