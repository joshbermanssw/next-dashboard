import { describe, it, expect } from "vitest"
import {
  getAccountsForCustomer,
  getAccount,
  getCardsForAccount,
  getCard,
} from "@/lib/data/accounts"
import { seedAccounts } from "@/lib/dashboard-data"

describe("getAccountsForCustomer", () => {
  it("returns every seed account stamped with the customer id", () => {
    const accounts = getAccountsForCustomer("cust-42")
    expect(accounts.map((a) => a.id)).toEqual(seedAccounts.map((a) => a.id))
    expect(accounts.every((a) => a.customerId === "cust-42")).toBe(true)
  })
})

describe("getAccount", () => {
  it("resolves a known account and null for an unknown one", () => {
    expect(getAccount("crypto")?.id).toBe("crypto")
    expect(getAccount("nope")).toBeNull()
  })
})

describe("getCardsForAccount", () => {
  it("returns the account's cards, [] for an unknown account", () => {
    const cards = getCardsForAccount("crypto")
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((c) => c.accountId === "crypto")).toBe(true)
    expect(getCardsForAccount("nope")).toEqual([])
  })
})

describe("getCard", () => {
  it("resolves a card under its owning account", () => {
    const found = getCard("crypto", "card-1")
    expect(found?.card.id).toBe("card-1")
    expect(found?.account.id).toBe("crypto")
  })

  it("returns null when the card is not owned by the given account", () => {
    // card-1 belongs to `crypto`, not `everyday`.
    expect(getCard("everyday", "card-1")).toBeNull()
  })

  it("returns null for an unknown card id", () => {
    expect(getCard("crypto", "ghost")).toBeNull()
  })
})
