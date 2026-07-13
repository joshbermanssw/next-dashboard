"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeftIcon,
  IdCardIcon,
  CreditCardIcon,
  CircleArrowDownIcon,
  MapPinIcon,
  BanknoteIcon,
  LandmarkIcon,
  ShieldIcon,
  FileTextIcon,
} from "lucide-react"
import { useAccounts } from "@/contexts/accounts-context"
import { getAccountSettings } from "@/lib/dashboard-data"
import { Panel, PanelTitle } from "@/components/ui/panel"
import { SettingsRow } from "@/components/ui/settings-row"

export function AccountSettings({ accountId }: { accountId: string }) {
  const { accounts } = useAccounts()
  const account = accounts.find((a) => a.id === accountId)

  if (!account) {
    return (
      <Panel className="flex flex-col items-start gap-3 p-6">
        <p className="text-base font-medium text-blueLightest">
          Account not found
        </p>
        <p className="text-sm text-blueLight">
          We couldn&apos;t find that account. It may have been removed.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-accentBlue hover:text-accentBlueHover"
        >
          Back to dashboard
        </Link>
      </Panel>
    )
  }

  const settings = getAccountSettings(account)

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-panel-border bg-white/5 text-blueLight transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-blueLightest">
          {account.label}
        </h1>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <Section title="Account Information">
          <SettingsRow icon={IdCardIcon} label="Account Details" interactive />
          <SettingsRow
            icon={CreditCardIcon}
            label="Linked Cards"
            subtitle={`${settings.linkedCards} linked`}
            interactive
          />
        </Section>

        <Section title="Settings">
          <SettingsRow
            icon={CircleArrowDownIcon}
            label="Account Status"
            trailing={<Value>{settings.status}</Value>}
          />
          <SettingsRow
            icon={MapPinIcon}
            label="Location"
            trailing={<Value>{settings.location}</Value>}
          />
          <SettingsRow
            icon={BanknoteIcon}
            label="Currency"
            trailing={
              <Value>
                {settings.currencyFlag} {settings.currency}
              </Value>
            }
          />
          <SettingsRow
            icon={LandmarkIcon}
            label="Use Type"
            trailing={<Value>{settings.useType}</Value>}
          />
          <SettingsRow icon={ShieldIcon} label="Limits" interactive />
        </Section>

        <Section title="Documents">
          <SettingsRow
            icon={FileTextIcon}
            label="Statements and Docs"
            interactive
          />
        </Section>
      </div>
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Panel className="flex flex-col gap-1 p-3 sm:p-4">
      <PanelTitle className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-label">
        {title}
      </PanelTitle>
      {children}
    </Panel>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-blueLight">{children}</span>
}
