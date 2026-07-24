"use client"

import { useTransition } from "react"
import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
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
import {
  ChevronDownIcon,
  CircleAlertIcon,
  CircleUserRoundIcon,
  LogOutIcon,
} from "lucide-react"

export function NavUser({
  activationIncomplete = false,
}: {
  /** Shows the alert dot and the "Finish setting up" entry. */
  activationIncomplete?: boolean
}) {
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
        <span className="relative flex">
          {/* Amber (warning), not red: this is "finish setting up", not an
              error — and red is already the notifications dot a few px away. */}
          <Avatar
            className={cn(
              "size-8 rounded-lg",
              activationIncomplete &&
                "ring-2 ring-warning ring-offset-2 ring-offset-background",
            )}
          >
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          {activationIncomplete ? (
            // The "!" names the reason the ring is there. Accessible name lives
            // on the trigger (below), so this is aria-hidden — announced once.
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] font-extrabold leading-none text-blueDarkest ring-2 ring-background"
            >
              !
            </span>
          ) : null}
        </span>
        <div className="hidden sm:grid text-sm leading-tight">
          <span className="truncate font-medium">
            {customer.firstName} {customer.lastName}
          </span>
          <span className="truncate text-xs text-foreground/70">
            {customer.email}
          </span>
        </div>
        {activationIncomplete ? (
          <span className="sr-only">Account setup incomplete</span>
        ) : null}
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
          {activationIncomplete ? (
            <DropdownMenuItem render={<Link href="/activate" />}>
              <CircleAlertIcon className="text-warning" />
              Finish setting up
            </DropdownMenuItem>
          ) : null}
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
