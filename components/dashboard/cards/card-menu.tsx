"use client"

import Link from "next/link"
import { toast } from "sonner"
import {
  CreditCardIcon,
  SlidersHorizontalIcon,
  WalletIcon,
  PackageIcon,
} from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { SettingsRow } from "@/components/ui/settings-row"

export function CardMenu({
  accountId,
  cardId,
}: {
  accountId: string
  cardId: string
}) {
  const base = `/account/${accountId}/cards/${cardId}`
  return (
    <Panel className="flex flex-col gap-1 p-3 sm:p-4">
      <Link href={`${base}/details`} className="block">
        <SettingsRow
          icon={CreditCardIcon}
          label="Card Details"
          subtitle="Card number, CVC and expiry"
          interactive
        />
      </Link>

      <Link href={`${base}/manage`} className="block">
        <SettingsRow
          icon={SlidersHorizontalIcon}
          label="Manage card"
          subtitle="Configure how your card can be used"
          interactive
        />
      </Link>

      <SettingsRow
        icon={WalletIcon}
        label="Add to Apple Wallet"
        subtitle="Add this card to your Apple Wallet"
        onClick={() => toast("Apple Wallet is coming soon")}
      />

      <SettingsRow
        icon={PackageIcon}
        label="Physical card"
        subtitle="Order a physical card"
        onClick={() => toast("Ordering a physical card is coming soon")}
      />
    </Panel>
  )
}
