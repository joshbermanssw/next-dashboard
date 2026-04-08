"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HomeIcon, WalletIcon, CreditCardIcon, ArrowLeftRightIcon, ShoppingCartIcon } from "lucide-react"

const navItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Accounts", url: "/accounts", icon: WalletIcon },
  { title: "Cards", url: "/cards", icon: CreditCardIcon },
  { title: "Payments", url: "/payments", icon: ArrowLeftRightIcon },
  { title: "Shopback", url: "/shopback", icon: ShoppingCartIcon },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/" />}
            >
              <Image src="/logos/dosh/dosh-d-white.svg" alt="DosshPay" width={24} height={24} />
              <span className="text-base font-semibold">DOSSHPAY</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-1 px-2 pt-4">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                render={<a href={item.url} />}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
