/**
 * Stubbed dashboard data.
 *
 * All values here are placeholders for the design phase. Once the backend
 * contract is finalised, swap these exports for BFF aggregator calls — the
 * component-facing types should stay stable so the UI doesn't change.
 */
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ReceiptTextIcon,
  PlusIcon,
  BitcoinIcon,
  WalletIcon,
  GlobeIcon,
} from "lucide-react"

export type AccountTab = {
  id: string
  label: string
  icon: LucideIcon
}

export type BankCard = {
  id: string
  /** Tailwind background-image token: `bg-bank-gradient-1` | `bg-bank-gradient-2` */
  gradient: "bg-bank-gradient-1" | "bg-bank-gradient-2"
  last4: string
}

export type QuickAction = {
  id: string
  label: string
  icon: LucideIcon
}

export type SeriesPoint = {
  label: string
  value: number
}

export type Expense = {
  id: string
  name: string
  date: string
  category: string
  amount: number
}

export const totalBalance = 42_000

export const accountTabs: AccountTab[] = [
  { id: "crypto", label: "Crypto", icon: BitcoinIcon },
  { id: "everyday", label: "Everyday", icon: WalletIcon },
  { id: "global", label: "Global", icon: GlobeIcon },
]

export const bankCards: BankCard[] = [
  { id: "card-1", gradient: "bg-bank-gradient-1", last4: "4291" },
  { id: "card-2", gradient: "bg-bank-gradient-2", last4: "8830" },
]

export const quickActions: QuickAction[] = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRightIcon },
  { id: "send", label: "Send", icon: ArrowUpRightIcon },
  { id: "pay-bills", label: "Pay Bills", icon: ReceiptTextIcon },
  { id: "deposit", label: "Deposit", icon: PlusIcon },
]

/** Money Flow — daily total balance over the selected window. */
export const moneyFlowChange = 6.79
export const moneyFlow: SeriesPoint[] = [
  { label: "Dec 2", value: 31_000 },
  { label: "Dec 3", value: 28_500 },
  { label: "Dec 4", value: 42_000 },
  { label: "Dec 5", value: 22_000 },
  { label: "Dec 6", value: 30_000 },
  { label: "Dec 7", value: 35_500 },
  { label: "Dec 8", value: 27_000 },
  { label: "Dec 9", value: 38_000 },
  { label: "Dec 10", value: 34_000 },
  { label: "Dec 11", value: 41_000 },
  { label: "Dec 12", value: 47_000 },
]

export const recentExpenses: Expense[] = [
  {
    id: "exp-1",
    name: "Dry Cleaning",
    date: "2026-02-17",
    category: "Miscellaneous",
    amount: 28.0,
  },
  {
    id: "exp-2",
    name: "Gifts for Friend",
    date: "2026-02-21",
    category: "Miscellaneous",
    amount: 75.0,
  },
  {
    id: "exp-3",
    name: "Pet Supplies",
    date: "2026-02-24",
    category: "Miscellaneous",
    amount: 56.8,
  },
  {
    id: "exp-4",
    name: "Books for Study",
    date: "2026-02-19",
    category: "Education",
    amount: 67.5,
  },
]

/** Spending Overview — monthly spend totals. */
export const spendingOverview: SeriesPoint[] = [
  { label: "Jun", value: 3_300 },
  { label: "Jul", value: 3_300 },
  { label: "Aug", value: 3_500 },
  { label: "Sep", value: 3_300 },
  { label: "Oct", value: 3_750 },
  { label: "Nov", value: 4_150 },
]
