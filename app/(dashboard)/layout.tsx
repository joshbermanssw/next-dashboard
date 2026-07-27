import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserProvider } from "@/contexts/user-context"
import { AccountsProvider } from "@/contexts/accounts-context"
import { Toaster } from "@/components/ui/sonner"
import { verifySession } from "@/server/auth/dal"
import { listSessions } from "@/lib/data/splitpay"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { customer } = await verifySession()

  // Hand the provider the live pools so the dashboard tile and the SplitPay hub
  // agree — contributions arrive through the public `/sp` pages, which the
  // client-side seed knows nothing about.
  const splitpaySessions = listSessions().map((s) => ({
    accountId: s.accountId,
    details: s.details,
  }))

  return (
    <UserProvider customer={customer}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="sidebar" collapsible="offcanvas" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <AccountsProvider splitpaySessions={splitpaySessions}>
                {children}
              </AccountsProvider>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </UserProvider>
  )
}
