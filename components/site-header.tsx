import { BellIcon, SettingsIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <HeaderIconButton label="Notifications" hasBadge>
            <BellIcon className="size-[18px]" />
          </HeaderIconButton>
          <HeaderIconButton label="Settings">
            <SettingsIcon className="size-[18px]" />
          </HeaderIconButton>
          <Separator
            orientation="vertical"
            className="mx-1 h-6 data-vertical:self-auto"
          />
          <NavUser />
        </div>
      </div>
    </header>
  )
}

function HeaderIconButton({
  label,
  hasBadge = false,
  children,
}: {
  label: string
  hasBadge?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex size-9 items-center justify-center rounded-lg text-blueLight transition-colors hover:bg-white/5 hover:text-blueLightest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      {hasBadge && (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-negative ring-2 ring-background" />
      )}
    </button>
  )
}
