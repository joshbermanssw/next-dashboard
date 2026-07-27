import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * The store is module-level mutable state, so every test needs a fresh copy of
 * the module rather than a fresh object. `resetModules()` + dynamic import
 * rebuilds it from the seed each time.
 */
type Store = typeof import("@/lib/data/splitpay")

const SESSION = "123-455"
const CODE = "846201"
const VISA = "4242424242424242"

let store: Store

beforeEach(async () => {
  vi.resetModules()
  store = await import("@/lib/data/splitpay")
})

describe("accessors", () => {
  it("resolves the seeded session by id and by account", () => {
    expect(store.getSession(SESSION)?.label).toBe("Barcelona Trip Fund")
    expect(store.getSessionByAccount("splitpay")?.details.sessionId).toBe(SESSION)
  })

  it("returns null for an unknown session", () => {
    expect(store.getSession("999-999")).toBeNull()
    expect(store.getSessionByAccount("nope")).toBeNull()
  })

  it("checks the access code exactly", () => {
    expect(store.verifyAccessCode(SESSION, CODE)).toBe(true)
    expect(store.verifyAccessCode(SESSION, `  ${CODE}  `)).toBe(true)
    expect(store.verifyAccessCode(SESSION, "000000")).toBe(false)
  })

  it("resolves a contributor only for their own token", () => {
    expect(store.getContributorByToken(SESSION, "seedtokenbenji1")?.name).toBe("Benji")
    expect(store.getContributorByToken(SESSION, "wrong")).toBeNull()
    // An empty token must never match a contributor whose token is falsy.
    expect(store.getContributorByToken(SESSION, "")).toBeNull()
  })
})

describe("recordContribution", () => {
  function contribute(overrides: Partial<Parameters<Store["recordContribution"]>[0]> = {}) {
    return store.recordContribution({
      sessionId: SESSION,
      code: CODE,
      name: "Benji",
      amount: 100,
      cardNumber: VISA,
      ...overrides,
    })
  }

  it("refuses a wrong access code without moving money", () => {
    const result = contribute({ code: "111111" })
    expect(result.ok).toBe(false)
    expect(store.getSession(SESSION)?.details.collected).toBe(1_400)
  })

  it("adds to the matching contributor rather than duplicating them", () => {
    const before = store.getSession(SESSION)!.details.contributors.length
    const result = contribute()

    expect(result.ok).toBe(true)
    const details = store.getSession(SESSION)!.details
    expect(details.contributors).toHaveLength(before)
    expect(details.contributors.find((c) => c.name === "Benji")?.amount).toBe(250)
    expect(details.collected).toBe(1_500)
  })

  it("matches the name case-insensitively", () => {
    contribute({ name: "  bEnJi " })
    const details = store.getSession(SESSION)!.details
    expect(details.contributors.filter((c) => c.name === "Benji")).toHaveLength(1)
    expect(details.contributors.find((c) => c.name === "Benji")?.amount).toBe(250)
  })

  it("adds an unknown payer as a new contributor", () => {
    const result = contribute({ name: "Ringo", amount: 50 })

    expect(result.ok).toBe(true)
    const ringo = store
      .getSession(SESSION)!
      .details.contributors.find((c) => c.name === "Ringo")
    expect(ringo?.amount).toBe(50)
    expect(ringo?.isCreator).toBe(false)
    expect(ringo?.authorised).toBe(false)
    expect(ringo?.token).toEqual(expect.any(String))
  })

  it("records brand and last four, never the card number", () => {
    contribute()
    const benji = store
      .getSession(SESSION)!
      .details.contributors.find((c) => c.name === "Benji")
    expect(benji?.savedCard).toEqual({ brand: "Visa", last4: "4242" })
    expect(JSON.stringify(benji)).not.toContain(VISA)
  })

  it("clamps an overpayment to what the pool still needs", () => {
    // $1,000 outstanding on a $2,400 target; paying $5,000 funds it exactly.
    const result = contribute({ amount: 5_000 })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.contribution.amount).toBe(1_000)
    expect(store.getSession(SESSION)!.details.collected).toBe(2_400)
  })

  it("refuses once the target is met", () => {
    contribute({ amount: 1_000 })
    const result = contribute({ amount: 10 })

    expect(result.ok).toBe(false)
    expect(store.getSession(SESSION)!.details.collected).toBe(2_400)
  })

  it("refuses a non-positive amount", () => {
    expect(contribute({ amount: 0 }).ok).toBe(false)
    expect(contribute({ amount: -50 }).ok).toBe(false)
  })

  it("refuses once the pool has left funding", () => {
    store.startSpending(SESSION)
    expect(contribute().ok).toBe(false)
  })

  it("writes a ledger row that points back at the payer", () => {
    const result = contribute({ amount: 60 })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const details = store.getSession(SESSION)!.details
    const row = details.contributions.find((c) => c.id === result.value.contribution.id)
    expect(row?.contributorId).toBe(result.value.contributor.id)
    expect(row?.amount).toBe(60)
    expect(row?.status).toBe("completed")
  })
})

describe("recordPaymentFromToken", () => {
  it("pays without an access code when the token resolves", () => {
    const result = store.recordPaymentFromToken({
      sessionId: SESSION,
      token: "seedtokenbenji1",
      amount: 250,
      cardNumber: VISA,
    })

    expect(result.ok).toBe(true)
    const benji = store
      .getSession(SESSION)!
      .details.contributors.find((c) => c.name === "Benji")
    expect(benji?.amount).toBe(400)
  })

  it("refuses an unknown token", () => {
    const result = store.recordPaymentFromToken({
      sessionId: SESSION,
      token: "not-a-token",
      amount: 10,
      cardNumber: VISA,
    })
    expect(result.ok).toBe(false)
    expect(store.getSession(SESSION)!.details.collected).toBe(1_400)
  })
})

describe("recordCreatorTopUp", () => {
  it("credits the creator and saves no card", () => {
    const result = store.recordCreatorTopUp({ sessionId: SESSION, amount: 200 })

    expect(result.ok).toBe(true)
    const creator = store
      .getSession(SESSION)!
      .details.contributors.find((c) => c.isCreator)
    expect(creator?.name).toBe("Mara Solano")
    expect(creator?.amount).toBe(600)
    expect(creator?.savedCard).toBeNull()
    expect(store.getSession(SESSION)!.details.collected).toBe(1_600)
  })
})

describe("updatePledge", () => {
  it("changes the pledge and date but never the amount paid", () => {
    const before = store.getContributorByToken(SESSION, "seedtokenbenji1")!.amount

    const result = store.updatePledge({
      sessionId: SESSION,
      token: "seedtokenbenji1",
      pledged: 600,
      targetDate: 1_800_000_000_000,
    })

    expect(result.ok).toBe(true)
    const benji = store.getContributorByToken(SESSION, "seedtokenbenji1")!
    expect(benji.pledged).toBe(600)
    expect(benji.targetDate).toBe(1_800_000_000_000)
    expect(benji.amount).toBe(before)
    expect(store.getSession(SESSION)!.details.collected).toBe(1_400)
  })

  it("floors a negative pledge at zero", () => {
    store.updatePledge({
      sessionId: SESSION,
      token: "seedtokenbenji1",
      pledged: -100,
      targetDate: null,
    })
    expect(store.getContributorByToken(SESSION, "seedtokenbenji1")!.pledged).toBe(0)
  })

  it("refuses an unknown token", () => {
    const result = store.updatePledge({
      sessionId: SESSION,
      token: "nope",
      pledged: 10,
      targetDate: null,
    })
    expect(result.ok).toBe(false)
  })
})

describe("setAuthorised", () => {
  it("grants and revokes spend authority", () => {
    expect(
      store.setAuthorised({ sessionId: SESSION, contributorId: "sp-james", authorised: true }).ok
    ).toBe(true)
    expect(
      store.getSession(SESSION)!.details.contributors.find((c) => c.id === "sp-james")
        ?.authorised
    ).toBe(true)

    store.setAuthorised({ sessionId: SESSION, contributorId: "sp-james", authorised: false })
    expect(
      store.getSession(SESSION)!.details.contributors.find((c) => c.id === "sp-james")
        ?.authorised
    ).toBe(false)
  })

  it("refuses to revoke the creator, who everyone else's authority comes from", () => {
    const result = store.setAuthorised({
      sessionId: SESSION,
      contributorId: "sp-mara",
      authorised: false,
    })

    expect(result.ok).toBe(false)
    expect(
      store.getSession(SESSION)!.details.contributors.find((c) => c.isCreator)?.authorised
    ).toBe(true)
  })
})

describe("inviteContributor", () => {
  it("adds an invitee with a pledge and their own token", () => {
    const result = store.inviteContributor({
      sessionId: SESSION,
      name: "Ringo Starr",
      email: "ringo@example.com",
      pledged: 100,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.pledged).toBe(100)
    expect(result.value.amount).toBe(0)
    expect(result.value.initial).toBe("RS")
    expect(result.value.token).toEqual(expect.any(String))
  })

  it("refuses a name or email already on the session", () => {
    expect(
      store.inviteContributor({
        sessionId: SESSION,
        name: "benji",
        email: "new@example.com",
        pledged: 10,
      }).ok
    ).toBe(false)

    expect(
      store.inviteContributor({
        sessionId: SESSION,
        name: "Someone Else",
        email: "BENJI@email.com",
        pledged: 10,
      }).ok
    ).toBe(false)
  })
})

describe("seed isolation", () => {
  it("does not mutate the exported seed, which the client reads separately", async () => {
    store.recordContribution({
      sessionId: SESSION,
      code: CODE,
      name: "Benji",
      amount: 100,
      cardNumber: VISA,
    })

    const { seedAccounts } = await import("@/lib/dashboard-data")
    const seeded = seedAccounts.find((a) => a.id === "splitpay")!.splitpay!
    expect(seeded.collected).toBe(1_400)
    expect(seeded.contributors.find((c) => c.name === "Benji")?.amount).toBe(150)
  })
})
