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
  AUD_CURRENCY,
  CURRENCY_BY_CODE,
  SEED_CUSTOMER_ID,
  type Account,
  type AccountKind,
  type BankCard,
  type SplitPayDetails,
} from "@/lib/dashboard-data"
import { getAccountsForCustomer } from "@/lib/data/accounts"
import { useUser } from "@/contexts/user-context"

type AccountsContextValue = {
  accounts: Account[]
  selected: Account
  selectAccount: (id: string) => void
  /** Create an account of `kind` settling in `currencyCode` (defaults to AUD
   * for kinds without a currency step). Selects the new account. */
  addAccount: (kind: AccountKind, currencyCode?: string) => void
  /** Create a SplitPay pool from the wizard input. Label is the pool name.
   * Selects the new account. */
  addSplitPayAccount: (input: {
    name: string
    targetAmount: number
    currencyCode: string
    deadline: number
  }) => void
  /** Add `amount` to a SplitPay pool's collected total and the caller's
   * contribution. No-op if the account isn't a SplitPay pool. */
  topUpSplitPay: (accountId: string, amount: number) => void
  /** Move a SplitPay pool from funding to spending. No-op otherwise. */
  startSpending: (accountId: string) => void
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
    (kind: AccountKind, currencyCode?: string) => {
      const id = `${kind}-${++nextId.current}`
      const currency =
        (currencyCode && CURRENCY_BY_CODE[currencyCode]) || AUD_CURRENCY
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
            currency: currency.code,
            currencyFlag: currency.flag,
            data: freshAccountData(),
          },
        ]
      })
      setSelectedId(id)
    },
    [customer.id]
  )

  const addSplitPayAccount = useCallback(
    (input: {
      name: string
      targetAmount: number
      currencyCode: string
      deadline: number
    }) => {
      const id = `splitpay-${++nextId.current}`
      const currency =
        CURRENCY_BY_CODE[input.currencyCode] || AUD_CURRENCY
      const initial = (customer.firstName?.[0] ?? "M").toUpperCase()
      const splitpay: SplitPayDetails = {
        accountNumber: String(Math.floor(100000 + Math.random() * 900000)),
        targetAmount: input.targetAmount,
        collected: 0,
        deadline: input.deadline,
        status: "funding",
        contributors: [
          {
            id: customer.id || SEED_CUSTOMER_ID,
            name: customer.firstName || "You",
            initial,
            amount: 0,
          },
        ],
      }
      setAccounts((prev) => [
        ...prev,
        {
          id,
          customerId: customer.id || SEED_CUSTOMER_ID,
          kind: "splitpay",
          label: input.name,
          accountType: "everyday",
          tier: "BASIC",
          currency: currency.code,
          currencyFlag: currency.flag,
          splitpay,
          data: freshAccountData(),
        },
      ])
      setSelectedId(id)
    },
    [customer.id, customer.firstName]
  )

  const topUpSplitPay = useCallback(
    (accountId: string, amount: number) => {
      if (!(amount > 0)) return
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id !== accountId || !a.splitpay) return a
          const meId = customer.id || SEED_CUSTOMER_ID
          return {
            ...a,
            data: { ...a.data, balance: a.splitpay.collected + amount },
            splitpay: {
              ...a.splitpay,
              collected: a.splitpay.collected + amount,
              contributors: a.splitpay.contributors.map((c) =>
                c.id === meId ? { ...c, amount: c.amount + amount } : c
              ),
            },
          }
        })
      )
    },
    [customer.id]
  )

  const startSpending = useCallback((accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId && a.splitpay?.status === "funding"
          ? { ...a, splitpay: { ...a.splitpay, status: "spending" } }
          : a
      )
    )
  }, [])

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
      addSplitPayAccount,
      topUpSplitPay,
      startSpending,
      getAccount,
      getCard,
    }),
    [
      accounts,
      selected,
      selectAccount,
      addAccount,
      addSplitPayAccount,
      topUpSplitPay,
      startSpending,
      getAccount,
      getCard,
    ]
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
