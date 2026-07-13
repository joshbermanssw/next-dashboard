"use client"

import { toast } from "sonner"
import {
  CreditCardIcon,
  ShieldCheckIcon,
  GaugeIcon,
  RepeatIcon,
  TagIcon,
  CoinsIcon,
  GlobeIcon,
} from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { SettingsRow } from "@/components/ui/settings-row"
import { brandLabel, type BankCard } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-label">
      {children}
    </p>
  )
}

function ValueText({
  children,
  tone = "default",
}: {
  children: string
  tone?: "default" | "positive"
}) {
  return (
    <span
      className={cn(
        "text-sm font-medium",
        tone === "positive" ? "text-positive" : "text-blueLight"
      )}
    >
      {children}
    </span>
  )
}

export function ManageCardSections({ card }: { card: BankCard }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <SectionLabel>Card information</SectionLabel>
        <Panel className="flex flex-col gap-1 p-3 sm:p-4">
          <SettingsRow
            icon={CreditCardIcon}
            label="Card type"
            trailing={<ValueText>{brandLabel(card.brand)}</ValueText>}
          />
          <SettingsRow
            icon={ShieldCheckIcon}
            label="Card status"
            trailing={
              card.status === "active" ? (
                <ValueText tone="positive">Active</ValueText>
              ) : (
                <ValueText>Frozen</ValueText>
              )
            }
          />
        </Panel>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Spending &amp; limits</SectionLabel>
        <Panel className="flex flex-col gap-1 p-3 sm:p-4">
          <SettingsRow
            icon={GaugeIcon}
            label="Limits"
            trailing={<ValueText>{card.limitPreset}</ValueText>}
          />
          <SettingsRow
            icon={RepeatIcon}
            label="Use type"
            trailing={<ValueText>{card.useType}</ValueText>}
          />
        </Panel>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Payment configuration</SectionLabel>
        <Panel className="flex flex-col gap-1 p-3 sm:p-4">
          <SettingsRow
            icon={TagIcon}
            label="Pricing"
            onClick={() => toast("Pricing options are coming soon")}
          />
          <SettingsRow
            icon={CoinsIcon}
            label="Money type"
            trailing={<ValueText>{card.moneyType}</ValueText>}
          />
          <SettingsRow
            icon={GlobeIcon}
            label="Currency"
            trailing={
              <ValueText>{`${card.currencyFlag} ${card.currency}`}</ValueText>
            }
          />
        </Panel>
      </section>
    </div>
  )
}
