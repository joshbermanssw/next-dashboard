/**
 * Account activation — the "Complete each step to unlock full access" checklist.
 *
 * There is no single "is activated" flag upstream; the state is spread across
 * the customer record, the KYC application and the preferences workflow. This
 * module folds those into one shape so the hub page, the nav badge and any
 * future gating all agree on what "done" means.
 */

export type ActivationTaskId =
  | "identity"
  | "security"
  | "preferences"
  | "billing"

export type ActivationTask = {
  id: ActivationTaskId
  title: string
  description: string
  done: boolean
  /** Where the hub row navigates to. */
  href: string
}

export type ActivationStatus = {
  tasks: ActivationTask[]
  completedCount: number
  totalCount: number
  /** True once every task is done — drives whether the nav badge shows. */
  complete: boolean
}

/**
 * Raw signals gathered from upstream, before interpretation.
 *
 * `security` and `billing` have no backing endpoint yet (there is no
 * web-biometrics registration and no payment-method API), so the aggregator
 * passes `false` and the hub routes those rows to their placeholder screens.
 * Give them a real source here when the endpoints land.
 */
export type ActivationSnapshot = {
  kycStatus: string | null
  preferencesStatus: string | null
  securityConfigured: boolean
  billingConfigured: boolean
}

// Upstream spells terminal states inconsistently across services, so match on a
// set rather than a single literal.
const KYC_DONE = new Set([
  "APPROVED",
  "COMPLETE",
  "COMPLETED",
  "VERIFIED",
  "CLEAR",
  "PASSED",
])

const PREFERENCES_DONE = new Set([
  "COMPLETE",
  "COMPLETED",
  "DONE",
  "ACCEPTED_DEFAULTS",
])

function isDone(value: string | null, done: Set<string>): boolean {
  return value != null && done.has(value.trim().toUpperCase())
}

export function deriveActivationStatus(
  snapshot: ActivationSnapshot,
): ActivationStatus {
  const tasks: ActivationTask[] = [
    {
      id: "identity",
      title: "Verify your identity",
      description: "Confirm your personal details",
      done: isDone(snapshot.kycStatus, KYC_DONE),
      href: "/activate/identity",
    },
    {
      id: "security",
      title: "Secure your account",
      description: "Enable biometrics and extra security",
      done: snapshot.securityConfigured,
      href: "/activate/security",
    },
    {
      id: "preferences",
      title: "Set your preferences",
      description: "Customise how Dossh works for you",
      done: isDone(snapshot.preferencesStatus, PREFERENCES_DONE),
      href: "/activate/preferences",
    },
    {
      id: "billing",
      title: "Complete billing setup",
      description: "Add a payment method to your plan",
      done: snapshot.billingConfigured,
      href: "/activate/billing",
    },
  ]

  const completedCount = tasks.filter((t) => t.done).length

  return {
    tasks,
    completedCount,
    totalCount: tasks.length,
    complete: completedCount === tasks.length,
  }
}

/**
 * What a customer with nothing done looks like. Used when the upstream reads
 * fail: an unknown state is shown as incomplete rather than silently "activated",
 * so the badge errs toward prompting the user instead of hiding a real gap.
 */
export const EMPTY_ACTIVATION_SNAPSHOT: ActivationSnapshot = {
  kycStatus: null,
  preferencesStatus: null,
  securityConfigured: false,
  billingConfigured: false,
}
