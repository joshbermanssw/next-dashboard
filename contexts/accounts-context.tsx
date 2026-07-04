"use client"

import { createContext, useContext, useRef, useState } from "react"
import {
  accountKindMeta,
  freshAccountData,
  seedAccounts,
  type Account,
  type AccountKind,
} from "@/lib/dashboard-data"

type AccountsContextValue = {
  accounts: Account[]
  selected: Account
  selectAccount: (id: string) => void
  addAccount: (kind: AccountKind) => void
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts)
  const [selectedId, setSelectedId] = useState(seedAccounts[0].id)
  const nextId = useRef(0)

  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0]

  function addAccount(kind: AccountKind) {
    const id = `${kind}-${++nextId.current}`
    const sameKind = accounts.filter((a) => a.kind === kind).length
    const { label } = accountKindMeta[kind]
    setAccounts((prev) => [
      ...prev,
      {
        id,
        kind,
        label: sameKind === 0 ? label : `${label} ${sameKind + 1}`,
        data: freshAccountData(),
      },
    ])
    setSelectedId(id)
  }

  return (
    <AccountsContext.Provider
      value={{ accounts, selected, selectAccount: setSelectedId, addAccount }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const context = useContext(AccountsContext)
  if (!context) {
    throw new Error("useAccounts must be used within an AccountsProvider")
  }
  return context
}
