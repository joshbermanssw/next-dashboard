"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { accountKindMeta } from "@/lib/dashboard-data"
import type { QrAccount } from "@/lib/qr-payment"
import { cn, formatCurrency } from "@/lib/utils"

/**
 * Bottom sheet for choosing an account — which one a QR pays into on the
 * Receive screen, and which one the money comes out of on the confirm screen.
 *
 * The choice is drafted locally and only committed on Confirm, so dismissing
 * the sheet leaves the current selection alone.
 */
export function AccountPicker({
  title,
  description,
  accounts,
  selectedId,
  onSelect,
  open,
  onOpenChange,
}: {
  /** Sheet heading, e.g. "Receive to" or "Pay from". */
  title: string
  /** Screen-reader explanation of what picking an account does here. */
  description: string
  accounts: QrAccount[]
  selectedId: string
  onSelect: (accountId: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [draftId, setDraftId] = React.useState(selectedId)

  // Re-sync each time it opens, so a dismissed sheet doesn't leave a stale
  // draft waiting to be committed the next time round.
  React.useEffect(() => {
    if (open) setDraftId(selectedId)
  }, [open, selectedId])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-panel-border bg-blueDarker text-blueLightest">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-semibold text-blueLightest">
            {title}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[45vh] overflow-y-auto px-4">
          {accounts.map((account) => {
            const Icon = accountKindMeta[account.kind].icon
            const isDraft = account.id === draftId

            return (
              <button
                key={account.id}
                type="button"
                onClick={() => setDraftId(account.id)}
                aria-pressed={isDraft}
                className="flex w-full items-center gap-4 border-b border-panel-border py-4 text-left last:border-b-0"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-blueLight">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-blueLightest">
                    {account.label}
                  </span>
                  <span className="block text-sm text-blueLight/60">
                    {formatCurrency(account.balance, { cents: true })}
                  </span>
                </span>

                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    isDraft
                      ? "bg-blueLightest text-blueDarker"
                      : "border border-panel-border",
                  )}
                >
                  {isDraft && <CheckIcon className="size-4" strokeWidth={3} />}
                </span>
              </button>
            )
          })}
        </div>

        <DrawerFooter>
          <Button
            type="button"
            onClick={() => {
              onSelect(draftId)
              onOpenChange(false)
            }}
            className="w-full rounded-full py-3.5 text-base font-semibold"
          >
            Confirm (1)
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
