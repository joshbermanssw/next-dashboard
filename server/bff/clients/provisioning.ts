import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import type { AddOnKey } from "@/lib/plan"
import type { BillingCycle } from "@/lib/plan-pricing"

/** Upstream's spelling of the account type. */
export type CustomerType = "EVERYDAY" | "CORPORATE"

/**
 * Which product the plan provisions as its base account. Everyday users get the
 * everyday wallet; the crypto option exists for plans sold as a crypto wallet.
 */
export type BaseProduct = "EVERYDAY" | "CRYPTO"

export type SoftProvisionInput = {
  planId: number
  billingCycle: BillingCycle
  customerType: CustomerType
  selectedBaseProduct?: BaseProduct
  selectedAddOns: readonly AddOnKey[]
  /**
   * Makes the call safe to retry. The caller derives this from the customer and
   * their selection, so a double-submit provisions once rather than twice.
   */
  idempotencyKey: string
}

export type SoftProvisionResult = {
  provisioningState: string
  planName: string
  softProvisioningComplete: boolean
  nextAction: string
}

type SoftProvisionWire = {
  success: boolean
  data: {
    provisioningState: string
    selectedPlan: { planName: string }
    setupSummary: { softProvisioningComplete: boolean; nextAction: string }
  }
}

/**
 * Commits the plan choice and provisions the customer's products.
 *
 * This is the write that turns a verified account into a usable one, so it runs
 * at the end of onboarding rather than per-step.
 */
export async function softProvision(
  bearer: string,
  customerId: string,
  input: SoftProvisionInput,
): Promise<SoftProvisionResult> {
  const res = await bffFetch<SoftProvisionWire>(
    `${services.accounts.baseUrl}/customers/${customerId}/soft-provisioning`,
    {
      method: "PUT",
      bearer,
      body: JSON.stringify({
        planId: input.planId,
        billingCycle: input.billingCycle,
        customerType: input.customerType,
        selectedBaseProduct: input.selectedBaseProduct ?? null,
        selectedAddOns: [...input.selectedAddOns],
        idempotencyKey: input.idempotencyKey,
      }),
      // Provisioning fans out across several backend products, so it needs more
      // headroom than the 5s default.
      timeoutMs: 15000,
    },
  )
  return {
    provisioningState: res.data.provisioningState,
    planName: res.data.selectedPlan.planName,
    softProvisioningComplete: res.data.setupSummary.softProvisioningComplete,
    nextAction: res.data.setupSummary.nextAction,
  }
}
