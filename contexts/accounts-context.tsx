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
  generateAccessCode,
  generateContributorToken,
  generateSessionId,
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
   * Selects the new account and returns it, so the caller can mirror it into
   * the server store (which is what makes its public `/sp` pages resolve). */
  addSplitPayAccount: (input: {
    name: string
    targetAmount: number
    currencyCode: string
    deadline: number
  }) => Account
  /** O(1) lookup of an account by id. */
  getAccount: (id: string) => Account | undefined
  /** O(1) lookup of a card (and its owning account) by id, scoped to an account. */
  getCard: (
    accountId: string,
    cardId: string,
  ) => { card: BankCard; account: Account } | undefined
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

/** A pool as the server store currently holds it, handed down at mount. */
export type SeedSplitPaySession = {
  accountId: string
  details: SplitPayDetails
}

export function AccountsProvider({
  children,
  splitpaySessions = [],
}: {
  children: React.ReactNode
  /**
   * Live SplitPay pools read server-side (see the dashboard layout). Without
   * these the provider would seed from the static seed and show stale money the
   * moment a contributor paid in from an invite email — the dashboard tile and
   * the hub would disagree about the same pool.
   */
  splitpaySessions?: SeedSplitPaySession[]
}) {
  const { customer } = useUser()
  // Seeded once, through the same accessor the server routes use, with any
  // live pool state layered over the static seed.
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const seeded = getAccountsForCustomer(customer.id)
    if (splitpaySessions.length === 0) return seeded

    const byAccount = new Map(splitpaySessions.map((s) => [s.accountId, s.details]))
    return seeded.map((account) => {
      const splitpay = byAccount.get(account.id)
      if (!splitpay) return account
      // The pool's collected total *is* the account balance for a SplitPay
      // account, so they move together.
      return {
        ...account,
        splitpay,
        data: { ...account.data, balance: splitpay.collected },
      }
    })
  })
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
        sessionId: generateSessionId(),
        accountNumber: String(Math.floor(100000 + Math.random() * 900000)),
        accessCode: generateAccessCode(),
        targetAmount: input.targetAmount,
        collected: 0,
        deadline: input.deadline,
        status: "funding",
        contributors: [
          {
            id: customer.id || SEED_CUSTOMER_ID,
            name: customer.firstName || "You",
            initial,
            email: null,
            // The creator's own share is theirs to set later; the pool target is
            // the group's number, not one person's pledge.
            pledged: 0,
            amount: 0,
            targetDate: null,
            isCreator: true,
            authorised: true,
            token: generateContributorToken(),
            savedCard: null,
          },
        ],
        contributions: [],
      }
      const account: Account = {
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
      }
      setAccounts((prev) => [...prev, account])
      setSelectedId(id)
      return account
    },
    [customer.id, customer.firstName]
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
      addSplitPayAccount,
      getAccount,
      getCard,
    }),
    [
      accounts,
      selected,
      selectAccount,
      addAccount,
      addSplitPayAccount,
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
