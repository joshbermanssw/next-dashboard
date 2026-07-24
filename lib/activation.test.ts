import { describe, it, expect } from "vitest"
import {
  deriveActivationStatus,
  EMPTY_ACTIVATION_SNAPSHOT,
  type ActivationSnapshot,
} from "@/lib/activation"

const snapshot = (over: Partial<ActivationSnapshot> = {}): ActivationSnapshot => ({
  ...EMPTY_ACTIVATION_SNAPSHOT,
  ...over,
})

describe("deriveActivationStatus", () => {
  it("reports a fresh account as 0 of 4 and incomplete", () => {
    const s = deriveActivationStatus(snapshot())
    expect(s.completedCount).toBe(0)
    expect(s.totalCount).toBe(4)
    expect(s.complete).toBe(false)
  })

  it("always returns the four tasks in hub order", () => {
    expect(deriveActivationStatus(snapshot()).tasks.map((t) => t.id)).toEqual([
      "identity",
      "security",
      "preferences",
      "billing",
    ])
  })

  it("is complete only when every task is done", () => {
    const s = deriveActivationStatus(
      snapshot({
        kycStatus: "APPROVED",
        preferencesStatus: "COMPLETE",
        securityConfigured: true,
        billingConfigured: true,
      }),
    )
    expect(s.completedCount).toBe(4)
    expect(s.complete).toBe(true)
  })

  it("is incomplete while any single task is outstanding", () => {
    const s = deriveActivationStatus(
      snapshot({
        kycStatus: "APPROVED",
        preferencesStatus: "COMPLETE",
        securityConfigured: true,
        billingConfigured: false,
      }),
    )
    expect(s.completedCount).toBe(3)
    expect(s.complete).toBe(false)
  })
})

describe("KYC status interpretation", () => {
  it.each(["APPROVED", "COMPLETE", "COMPLETED", "VERIFIED", "CLEAR", "PASSED"])(
    "treats %s as verified",
    (status) => {
      const s = deriveActivationStatus(snapshot({ kycStatus: status }))
      expect(s.tasks[0].done).toBe(true)
    },
  )

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    const s = deriveActivationStatus(snapshot({ kycStatus: " approved " }))
    expect(s.tasks[0].done).toBe(true)
  })

  it.each(["PENDING", "IN_REVIEW", "REJECTED", "", "unknown-value"])(
    "treats %s as not verified",
    (status) => {
      const s = deriveActivationStatus(snapshot({ kycStatus: status }))
      expect(s.tasks[0].done).toBe(false)
    },
  )

  it("treats a missing status as not verified", () => {
    expect(deriveActivationStatus(snapshot({ kycStatus: null })).tasks[0].done).toBe(
      false,
    )
  })
})

describe("preferences status interpretation", () => {
  it.each(["COMPLETE", "COMPLETED", "DONE", "ACCEPTED_DEFAULTS"])(
    "treats %s as set",
    (status) => {
      const s = deriveActivationStatus(snapshot({ preferencesStatus: status }))
      expect(s.tasks[2].done).toBe(true)
    },
  )

  it.each(["IN_PROGRESS", "NOT_STARTED", null])(
    "treats %s as not set",
    (status) => {
      const s = deriveActivationStatus(snapshot({ preferencesStatus: status }))
      expect(s.tasks[2].done).toBe(false)
    },
  )
})

describe("failure behaviour", () => {
  it("shows an unknown account as incomplete rather than activated", () => {
    // The badge must err toward prompting the user when upstream reads fail.
    const s = deriveActivationStatus(EMPTY_ACTIVATION_SNAPSHOT)
    expect(s.complete).toBe(false)
    expect(s.tasks.every((t) => !t.done)).toBe(true)
  })
})
