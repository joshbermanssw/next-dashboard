import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserProvider } from "@/contexts/user-context"
import { meQueryOptions } from "@/queries/user"

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (!me) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { data: customer } = useSuspenseQuery(meQueryOptions)
  if (!customer) return null

  return (
    <UserProvider customer={customer}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="sidebar" collapsible="icon" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
