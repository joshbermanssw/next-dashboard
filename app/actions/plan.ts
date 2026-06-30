"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/server/auth/dal"
import type { Session } from "@/server/auth/session"
import { subscribePlan, cancelPlan } from "@/server/bff/clients/plan"
import { getCustomerAccount } from "@/server/bff/clients/customer"

export type PlanActionState = { success: boolean; message: string }

const PLAN_PATH = "/settings/plan"

// accountId is captured at login, but sessions predating this feature lack it.
// Resolve on demand so actions work without forcing a re-login.
async function resolveAccountId(session: Session): Promise<string | undefined> {
  if (session.accountId) return session.accountId
  try {
    const acct = await getCustomerAccount(session.upstreamJwt, session.customer.id)
    return acct.accountId
  } catch {
    return undefined
  }
}

export async function subscribeToPlanAction(
  planId: number,
  billingCycle: string,
): Promise<PlanActionState> {
  const session = await verifySession()
  const accountId = await resolveAccountId(session)
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
  const accountId = await resolveAccountId(session)
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
    revalidatePath(PLAN_PATH)
    return { success: true, message: "Your plan has been cancelled." }
  } catch {
    return { success: false, message: "Couldn't cancel your plan. Please try again." }
  }
}
