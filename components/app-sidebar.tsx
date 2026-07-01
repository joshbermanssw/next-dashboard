"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  HomeIcon,
  ChartColumnIcon,
  SearchIcon,
  TrendingUpIcon,
  ReceiptIcon,
} from "lucide-react"

const navItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Budget Planner", url: "/budget-planner", icon: ChartColumnIcon },
  { title: "Dossher", url: "/dossher", icon: SearchIcon },
  { title: "Investment Tracker", url: "/investment-tracker", icon: TrendingUpIcon },
  { title: "Expense Manager", url: "/expense-manager", icon: ReceiptIcon },
]


const menuButtonClass =
  "h-12 gap-3 rounded-lg px-3 text-[15px] text-sidebar-foreground [&_svg]:size-5 data-active:bg-white/[0.06] data-active:font-medium data-active:text-blueLightest data-active:ring-1 data-active:ring-inset data-active:ring-sidebar-border hover:bg-white/[0.04] hover:text-blueLightest"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-6 pt-6 pb-2">
        <Link href="/" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/logos/dosh/dosh-d-white.svg"
              alt=""
              width={26}
              height={26}
              className="size-6"
            />
            <span className="text-xl font-bold tracking-wide text-blueLightest">
              DOSSHPAY
            </span>
          </div>
          <span className="text-xs font-medium text-label">
            Your Banking, your way
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-4">
        <SidebarMenu className="gap-1.5">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                className={menuButtonClass}
                render={<Link href={item.url} />}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="gap-4 px-4 pb-6">
        {/* Chatbot launcher placeholder — bottom-left corner */}
        <button
          type="button"
          aria-label="Open DosshPay assistant"
          className="flex size-12 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-sidebar-border transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="/logos/dosh/dosh-d-white.svg"
            alt=""
            width={22}
            height={22}
            className="size-5.5"
          />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
