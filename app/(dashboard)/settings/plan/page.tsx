import type { ReactNode } from "react"
import { verifySession } from "@/server/auth/dal"
import { getCurrentPlan } from "@/server/bff/clients/plan"
import { CurrentPlanCard } from "@/components/dashboard/settings/plan/current-plan-card"
import { PlanFeatures } from "@/components/dashboard/settings/plan/plan-features"
import { Panel } from "@/components/ui/panel"
import type { CurrentPlan } from "@/lib/plan"

function PlanMessage({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="flex flex-col gap-1 p-5">
      <p className="text-base font-medium text-blueLightest">{title}</p>
      <p className="text-sm text-blueLight">{body}</p>
    </Panel>
  )
}

export default async function PlanPage() {
  const session = await verifySession()

  let content: ReactNode
  if (!session.accountId) {
    content = (
      <PlanMessage
        title="No account found"
        body="We couldn't find an account linked to your profile. Please contact support."
      />
    )
  } else {
    let plan: CurrentPlan | null = null
    let failed = false
    try {
      plan = await getCurrentPlan(session.upstreamJwt, session.accountId)
    } catch {
      failed = true
    }

    if (failed) {
      content = (
        <PlanMessage
          title="Couldn't load your plan"
          body="Something went wrong fetching your plan. Please try again later."
        />
      )
    } else if (!plan) {
      content = (
        <PlanMessage
          title="No active plan"
          body="You don't have an active subscription plan yet."
        />
      )
    } else {
      content = (
        <>
          <CurrentPlanCard plan={plan} />
          <PlanFeatures features={plan.features} />
        </>
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold text-blueLightest">Your Plan</h1>
      <div className="flex max-w-2xl flex-col gap-6">{content}</div>
    </div>
  )
}
