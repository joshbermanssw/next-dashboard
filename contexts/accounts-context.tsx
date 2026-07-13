"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  accountKindMeta,
  freshAccountData,
  SEED_CUSTOMER_ID,
  type Account,
  type AccountKind,
  type BankCard,
} from "@/lib/dashboard-data"
import { getAccountsForCustomer } from "@/lib/data/accounts"
import { useUser } from "@/contexts/user-context"

type AccountsContextValue = {
  accounts: Account[]
  selected: Account
  selectAccount: (id: string) => void
  addAccount: (kind: AccountKind) => void
  /** O(1) lookup of an account by id. */
  getAccount: (id: string) => Account | undefined
  /** O(1) lookup of a card (and its owning account) by id, scoped to an account. */
  getCard: (
    accountId: string,
    cardId: string,
  ) => { card: BankCard; account: Account } | undefined
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useUser()
  // Seeded once, through the same accessor the server routes use.
  const [accounts, setAccounts] = useState<Account[]>(() =>
    getAccountsForCustomer(customer.id)
  )
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? "")
  const nextId = useRef(0)

  // Id indexes rebuilt only when the account list changes → selectors are O(1).
  const accountIndex = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  )
  const cardIndex = useMemo(() => {
    const map = new Map<string, { card: BankCard; account: Account }>()
    for (const account of accounts) {
      for (const card of account.data.cards) {
        map.set(card.id, { card, account })
      }
    }
    return map
  }, [accounts])

  const selected = accountIndex.get(selectedId) ?? accounts[0]

  const selectAccount = useCallback((id: string) => setSelectedId(id), [])

  const addAccount = useCallback(
    (kind: AccountKind) => {
      const id = `${kind}-${++nextId.current}`
      setAccounts((prev) => {
        const sameKind = prev.filter((a) => a.kind === kind).length
        const { label } = accountKindMeta[kind]
        return [
          ...prev,
          {
            id,
            customerId: customer.id || SEED_CUSTOMER_ID,
            kind,
            label: sameKind === 0 ? label : `${label} ${sameKind + 1}`,
            // New accounts start on the basic everyday face until a plan is chosen.
            accountType: "everyday",
            tier: "BASIC",
            data: freshAccountData(),
          },
        ]
      })
      setSelectedId(id)
    },
    [customer.id]
  )

  const getAccount = useCallback(
    (id: string) => accountIndex.get(id),
    [accountIndex]
  )
  const getCard = useCallback(
    (accountId: string, cardId: string) => {
      const hit = cardIndex.get(cardId)
      return hit && hit.account.id === accountId ? hit : undefined
    },
    [cardIndex]
  )

  const value = useMemo(
    () => ({
      accounts,
      selected,
      selectAccount,
      addAccount,
      getAccount,
      getCard,
    }),
    [accounts, selected, selectAccount, addAccount, getAccount, getCard]
  )

  return (
    <AccountsContext.Provider value={value}>
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

/** An account by id (client-state lookup), or `undefined` if unknown. */
export function useAccount(accountId: string): Account | undefined {
  return useAccounts().getAccount(accountId)
}

/** A card and its owning account by id, scoped to an account; `undefined` if
 * the card is unknown or not owned by that account. */
export function useCard(
  accountId: string,
  cardId: string,
): { card: BankCard; account: Account } | undefined {
  return useAccounts().getCard(accountId, cardId)
}
