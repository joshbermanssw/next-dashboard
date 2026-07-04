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
  ShoppingBagIcon,
  ShoppingCartIcon,
  CarIcon,
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

export type Transaction = {
  id: string
  name: string
  /** Secondary line — merchant detail, payer, or location. */
  detail: string
  icon: LucideIcon
  /** Signed AUD amount — negative for debits, positive for credits. */
  amount: number
}

export type SpendingCategoryId =
  | "crypto"
  | "travel"
  | "shopping"
  | "groceries"
  | "other"

export type SpendingCategory = {
  id: SpendingCategoryId
  label: string
  value: number
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

export const recentActivity: Transaction[] = [
  {
    id: "tx-1",
    name: "Apple Store",
    detail: "AirPods Pro",
    icon: ShoppingBagIcon,
    amount: -249.99,
  },
  {
    id: "tx-2",
    name: "Salary Deposit",
    detail: "Dosshpay Pty Ltd",
    icon: PlusIcon,
    amount: 4_850.0,
  },
  {
    id: "tx-3",
    name: "Uber",
    detail: "Sydney CBD",
    icon: CarIcon,
    amount: -34.6,
  },
  {
    id: "tx-4",
    name: "Woolworths",
    detail: "Town Hall Metro",
    icon: ShoppingCartIcon,
    amount: -86.2,
  },
]

/** Spending Overview — current-month spend by category (sums to the donut's
 * centre total). Ordered largest-first; the donut renders in this order. */
export const spendingByCategory: SpendingCategory[] = [
  { id: "crypto", label: "Crypto", value: 1_207 },
  { id: "travel", label: "Travel", value: 687 },
  { id: "shopping", label: "Shopping", value: 284 },
  { id: "groceries", label: "Groceries", value: 118 },
  { id: "other", label: "Other", value: 71 },
]
