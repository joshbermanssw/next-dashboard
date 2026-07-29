import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Like the session store, this is module-level mutable state — reset the module
 * between tests rather than the object.
 */
type Balances = typeof import("@/lib/data/balances")

let balances: Balances

// Seeded Everyday balance, read once so the assertions below stay relative to
// the seed rather than hard-coding a figure that moves when the seed does.
let everyday: number

beforeEach(async () => {
  vi.resetModules()
  balances = await import("@/lib/data/balances")
  everyday = balances.balanceOf("everyday")!
})

describe("balanceOf", () => {
  it("reads the seeded balance before anything moves", () => {
    expect(everyday).toBeGreaterThan(0)
  })

  it("returns null for an account that doesn't exist", () => {
    expect(balances.balanceOf("nope")).toBeNull()
  })
})

describe("debit", () => {
  it("takes money out and reports what's left", () => {
    const result = balances.debit("everyday", 100)

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.balance).toBe(round2(everyday - 100))
    expect(balances.balanceOf("everyday")).toBe(round2(everyday - 100))
  })

  it("accumulates across several debits", () => {
    balances.debit("everyday", 100)
    balances.debit("everyday", 50.5)
    expect(balances.balanceOf("everyday")).toBe(round2(everyday - 150.5))
  })

  it("refuses to overdraw", () => {
    const result = balances.debit("everyday", everyday + 0.01)

    expect(result.ok).toBe(false)
    // The balance must be untouched — a rejected debit that still moved money
    // would credit a pool with money the customer does not have.
    expect(balances.balanceOf("everyday")).toBe(everyday)
  })

  it("allows spending the account down to exactly zero", () => {
    expect(balances.debit("everyday", everyday).ok).toBe(true)
    expect(balances.balanceOf("everyday")).toBe(0)
  })

  it("rejects zero, negative and unknown accounts", () => {
    expect(balances.debit("everyday", 0).ok).toBe(false)
    expect(balances.debit("everyday", -50).ok).toBe(false)
    expect(balances.debit("nope", 10).ok).toBe(false)
  })
})

describe("credit", () => {
  it("puts money back", () => {
    balances.debit("everyday", 200)
    balances.credit("everyday", 200)
    expect(balances.balanceOf("everyday")).toBe(everyday)
  })

  it("ignores an unknown account rather than inventing one", () => {
    balances.credit("nope", 100)
    expect(balances.balanceOf("nope")).toBeNull()
  })
})

describe("movedBalances", () => {
  it("reports nothing until something moves", () => {
    expect(balances.movedBalances()).toEqual([])
  })

  it("reports only the accounts that changed", () => {
    balances.debit("everyday", 25)
    expect(balances.movedBalances()).toEqual([
      { accountId: "everyday", balance: round2(everyday - 25) },
    ])
  })
})

describe("seed isolation", () => {
  it("leaves the exported account seed alone", async () => {
    balances.debit("everyday", 300)

    // The client renders from this seed independently; a debit that mutated it
    // would make the figure depend on whether the server had been asked first.
    const { seedAccounts } = await import("@/lib/dashboard-data")
    const seeded = seedAccounts.find((a) => a.id === "everyday")!
    expect(seeded.data.balance).toBe(everyday)
  })
})

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
