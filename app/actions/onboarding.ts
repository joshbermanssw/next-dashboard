"use server"

import { verifySession } from "@/server/auth/dal"
import { softProvision } from "@/server/bff/clients/provisioning"
import { UpstreamError } from "@/server/bff/http"
import { signupStubEnabled } from "@/server/config/dev-stub"
import type { AddOnKey } from "@/lib/plan"
import type { BillingCycle } from "@/lib/plan-pricing"

export type CompleteOnboardingResult =
  | { ok: true; planName: string }
  | { ok: false; message: string }

/**
 * Builds a key that is stable for a given customer + selection.
 *
 * Provisioning is the one irreversible write in onboarding, so a double-submit
 * (impatient click, retried request) must not provision twice. Deriving the key
 * from the selection rather than randomly means a genuine retry of the *same*
 * choice is deduplicated, while changing the plan is correctly a new request.
 */
function idempotencyKey(
  customerId: string,
  planId: number,
  cycle: BillingCycle,
  addOns: readonly AddOnKey[],
): string {
  const addOnPart = [...addOns].sort().join("+") || "none"
  return `web:${customerId}:${planId}:${cycle}:${addOnPart}`.slice(0, 128)
}

export async function completeOnboardingAction(input: {
  planId: number
  billingCycle: BillingCycle
  selectedAddOns: AddOnKey[]
}): Promise<CompleteOnboardingResult> {
  const session = await verifySession()
  const customerId = session.customer.id

  // Dev stub: the forged sign-up session has no real backend account to
  // provision against, so skip the call and let the flow reach /activate.
  if (signupStubEnabled()) {
    return { ok: true, planName: "your plan" }
  }

  try {
    const result = await softProvision(session.upstreamJwt, customerId, {
      planId: input.planId,
      billingCycle: input.billingCycle,
      // This flow is the everyday consumer path; corporate signup is separate
      // and will pass CORPORATE plus a businessType.
      customerType: "EVERYDAY",
      selectedBaseProduct: "EVERYDAY",
      selectedAddOns: input.selectedAddOns,
      idempotencyKey: idempotencyKey(
        customerId,
        input.planId,
        input.billingCycle,
        input.selectedAddOns,
      ),
    })
    return { ok: true, planName: result.planName }
  } catch (err) {
    if (err instanceof UpstreamError) {
      return {
        ok: false,
        message:
          err.status >= 500
            ? "Our systems are busy right now. Please try again in a moment."
            : "We couldn't set up that plan. Please check your selection and try again.",
      }
    }
    return {
      ok: false,
      message: "Unable to reach DosshPay. Check your connection and try again.",
    }
  }
}
