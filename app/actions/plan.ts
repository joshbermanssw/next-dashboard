"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/server/auth/dal"
import type { Session } from "@/server/auth/session"
import { subscribePlan, cancelPlan } from "@/server/bff/clients/plan"
import { getPlanCatalog } from "@/server/bff/clients/plan-catalog"
import { getCustomerAccount } from "@/server/bff/clients/customer"
import type { AccountType } from "@/lib/definitions"

export type PlanActionState = { success: boolean; message: string }

const PLAN_PATH = "/settings/plan"

type ResolvedAccount = { accountId?: string; accountType: AccountType }

// accountId/accountType are captured at login, but sessions predating this feature
// lack them. Resolve on demand so actions work without forcing a re-login.
async function resolveAccount(session: Session): Promise<ResolvedAccount> {
  if (session.accountId) {
    return { accountId: session.accountId, accountType: session.accountType ?? "everyday" }
  }
  try {
    const acct = await getCustomerAccount(session.upstreamJwt, session.customer.id)
    return { accountId: acct.accountId, accountType: acct.accountType ?? "everyday" }
  } catch {
    return { accountId: undefined, accountType: "everyday" }
  }
}

export async function subscribeToPlanAction(
  planId: number,
  billingCycle: string,
): Promise<PlanActionState> {
  const session = await verifySession()
  const { accountId } = await resolveAccount(session)
  if (!accountId) {
    return { success: false, message: "No account linked to your profile." }
  }
  if (!Number.isInteger(planId)) {
    return { success: false, message: "Invalid plan." }
  }

  try {
    await subscribePlan(session.upstreamJwt, accountId, planId, billingCycle)
    revalidatePath(PLAN_PATH)
    return { success: true, message: "Your plan has been updated." }
  } catch {
    return { success: false, message: "Couldn't update your plan. Please try again." }
  }
}

export async function cancelPlanAction(
  planSubscriptionId: string,
  cancelReason?: string,
): Promise<PlanActionState> {
  const session = await verifySession()
  const { accountId, accountType } = await resolveAccount(session)
  if (!accountId) {
    return { success: false, message: "No account linked to your profile." }
  }
  if (!planSubscriptionId) {
    return { success: false, message: "Missing subscription." }
  }

  try {
    await cancelPlan(
      session.upstreamJwt,
      accountId,
      planSubscriptionId,
      cancelReason?.trim() || undefined,
    )
  } catch {
    return { success: false, message: "Couldn't cancel your plan. Please try again." }
  }

  // Never leave the user without a plan — move them to the free plan. Best-effort:
  // if this fails the cancel still stands and the page shows the catalogue to re-pick.
  let movedToFree = false
  try {
    const catalog = await getPlanCatalog(accountType)
    const freePlan = catalog.find((p) => p.monthlyPriceMinor <= 0)
    if (freePlan) {
      await subscribePlan(session.upstreamJwt, accountId, freePlan.id, "monthly")
      movedToFree = true
    }
  } catch {
    // downgrade failed — leave as cancelled; surfaced via the page state
  }

  revalidatePath(PLAN_PATH)
  return {
    success: true,
    message: movedToFree
      ? "Your plan was cancelled — you're now on the free plan."
      : "Your plan has been cancelled.",
  }
}
