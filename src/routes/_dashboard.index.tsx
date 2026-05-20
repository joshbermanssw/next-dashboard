import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { meQueryOptions } from "@/queries/user"

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardHome,
})

function DashboardHome() {
  const { data: customer } = useSuspenseQuery(meQueryOptions)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {customer?.firstName}
      </h1>
    </div>
  )
}
