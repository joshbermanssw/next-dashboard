import { Suspense } from "react"
import Link from "next/link"
import { SettingsIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { NavUserActivation } from "@/components/nav-user-activation"
import {
  NotificationsMenu,
  headerIconButtonClass,
} from "@/components/notifications-menu"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 py-2 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NotificationsMenu />
          <Link
            href="/settings"
            aria-label="Settings"
            className={headerIconButtonClass}
          >
            <SettingsIcon className="size-[18px]" />
          </Link>
          <Separator
            orientation="vertical"
            className="mx-1 h-6 data-vertical:self-auto"
          />
          <Suspense fallback={<NavUser />}>
            <NavUserActivation />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
