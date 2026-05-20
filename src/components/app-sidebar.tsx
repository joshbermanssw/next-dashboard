import { useLocation, Link } from "@tanstack/react-router"
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
  SettingsIcon,
} from "lucide-react"

const navItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Budget Planner", url: "/budget-planner", icon: ChartColumnIcon },
  { title: "Dossher", url: "/dossher", icon: SearchIcon },
  { title: "Investment Tracker", url: "/investment-tracker", icon: TrendingUpIcon },
  { title: "Expense Manager", url: "/expense-manager", icon: ReceiptIcon },
]

const settingsItem = { title: "Settings", url: "/settings", icon: SettingsIcon }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col justify-center gap-2 p-1.5">
              <div className="flex items-center gap-2">
                <img src="/logos/dosh/dosh-d-white.svg" alt="DosshPay" width={24} height={24} />
                <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">DOSSHPAY</span>
              </div>
              <span className="text-xs font-semibold text-blueLight group-data-[collapsible=icon]:hidden">
                Your Banking, Your Way
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-1 px-2 pt-4">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                render={<Link to={item.url} />}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === settingsItem.url}
              render={<Link to={settingsItem.url} />}
            >
              <settingsItem.icon className="size-4" />
              <span>{settingsItem.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
