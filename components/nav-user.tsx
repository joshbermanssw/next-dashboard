"use client"

import { useTransition } from "react"
import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"
import { useUser } from "@/contexts/user-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, CircleUserRoundIcon, LogOutIcon } from "lucide-react"

export function NavUser() {
  const { customer } = useUser()
  const [pending, startTransition] = useTransition()
  const initials = `${customer.firstName[0]}${customer.lastName[0]}`

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted aria-expanded:bg-muted"
          />
        }
      >
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:grid text-sm leading-tight">
          <span className="truncate font-medium">
            {customer.firstName} {customer.lastName}
          </span>
          <span className="truncate text-xs text-foreground/70">
            {customer.email}
          </span>
        </div>
        <ChevronDownIcon className="ml-1 size-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-popover-foreground">
                  {customer.firstName} {customer.lastName}
                </span>
                <span className="truncate text-xs text-popover-foreground/60">
                  {customer.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <CircleUserRoundIcon />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={pending}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
