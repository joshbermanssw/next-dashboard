"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccounts } from "@/contexts/accounts-context"
import { ACCOUNT_KINDS, accountKindMeta } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function AccountTabs() {
  const { accounts, selected, selectAccount, addAccount } = useAccounts()
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const prevCount = React.useRef(accounts.length)

  // A freshly added pill lands at the end of the row — bring it into view.
  React.useEffect(() => {
    const el = scrollerRef.current
    if (el && accounts.length > prevCount.current) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" })
    }
    prevCount.current = accounts.length
  }, [accounts.length])

  return (
    <div className="flex items-center gap-2">
      <div
        ref={scrollerRef}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]"
      >
        {accounts.map((account) => {
          const isActive = account.id === selected.id
          const Icon = accountKindMeta[account.kind].icon
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => selectAccount(account.id)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-accentBlue/40 bg-accentBlue/15 text-accentBlue"
                  : "border-panel-border bg-white/5 text-blueLight hover:bg-white/10"
              )}
            >
              <Icon className="size-4" />
              {account.label}
            </button>
          )
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-panel-border bg-white/5 px-3.5 py-2 text-sm font-medium text-blueLight transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <PlusIcon className="size-4" />
          Add account
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {ACCOUNT_KINDS.map((kind) => {
            const meta = accountKindMeta[kind]
            return (
              <DropdownMenuItem key={kind} onClick={() => addAccount(kind)}>
                <meta.icon className="size-4" />
                {meta.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
