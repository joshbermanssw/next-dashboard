"use client"

import { BellIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  recentNotifications,
  unreadNotificationCount,
} from "@/lib/profile-data"
import { cn } from "@/lib/utils"

/** Shared styling for the round header action buttons (bell, settings). */
export const headerIconButtonClass =
  "relative flex size-9 items-center justify-center rounded-lg text-blueLight transition-colors hover:bg-white/5 hover:text-blueLightest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Notifications${
              unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ""
            }`}
            className={headerIconButtonClass}
          />
        }
      >
        <BellIcon className="size-[18px]" />
        {unreadNotificationCount > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-negative ring-2 ring-background" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <span className="text-sm font-semibold text-popover-foreground">
            Notifications
          </span>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:underline"
          >
            Mark all read
          </button>
        </div>

        <ul className="max-h-[360px] overflow-y-auto py-1">
          {recentNotifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    n.tone === "positive"
                      ? "bg-positive/15 text-positive"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  <n.icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-popover-foreground">
                      {n.title}
                    </span>
                    {n.unread && (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="truncate text-xs text-popover-foreground/60">
                    {n.body}
                  </span>
                  <span className="mt-0.5 text-[11px] text-popover-foreground/45">
                    {n.time}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-foreground/10 p-2">
          <button
            type="button"
            className="w-full rounded-md py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-foreground/5"
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
