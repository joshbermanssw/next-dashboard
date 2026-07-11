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
  SplitIcon,
  GemIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CarIcon,
  HomeIcon,
  TvIcon,
  PlaneIcon,
  HotelIcon,
  CoffeeIcon,
} from "lucide-react"

export type BankCard = {
  id: string
  last4: string
}

export type QuickAction = {
  id: string
  label: string
  icon: LucideIcon
}

export const TIME_RANGES = ["1M", "3M", "6M", "1Y"] as const
export type TimeRange = (typeof TIME_RANGES)[number]

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

/* ---------------------------------------------------------------- accounts */

export type AccountKind =
  | "crypto"
  | "everyday"
  | "global"
  | "splitpay"
  | "asset"

/** Picker order for the "Add account" menu. */
export const ACCOUNT_KINDS: AccountKind[] = [
  "crypto",
  "everyday",
  "global",
  "splitpay",
  "asset",
]

export const accountKindMeta: Record<
  AccountKind,
  { label: string; icon: LucideIcon }
> = {
  crypto: { label: "Crypto", icon: BitcoinIcon },
  everyday: { label: "Everyday", icon: WalletIcon },
  global: { label: "Global", icon: GlobeIcon },
  splitpay: { label: "SplitPay", icon: SplitIcon },
  asset: { label: "Asset", icon: GemIcon },
}

/** Everything the dashboard shows for one account. */
export type AccountData = {
  balance: number
  cards: BankCard[]
  /** Every series ends at `balance` so the Money Flow chart always agrees
   * with the Total Balance card; trend % is computed first → last point. */
  moneyFlowByRange: Record<TimeRange, SeriesPoint[]>
  recentActivity: Transaction[]
  /** Spend by category per window, ordered largest-first; each window keeps
   * the same category → colour mapping. */
  spendingByRange: Record<TimeRange, SpendingCategory[]>
}

export type Account = {
  id: string
  kind: AccountKind
  label: string
  data: AccountData
}

export const quickActions: QuickAction[] = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRightIcon },
  { id: "send", label: "Send", icon: ArrowUpRightIcon },
  { id: "pay-bills", label: "Pay Bills", icon: ReceiptTextIcon },
  { id: "deposit", label: "Deposit", icon: PlusIcon },
]

const cryptoMoneyFlow: Record<TimeRange, SeriesPoint[]> = {
  "1M": [
    { label: "Nov 14", value: 39_800 },
    { label: "Nov 17", value: 40_600 },
    { label: "Nov 20", value: 39_900 },
    { label: "Nov 23", value: 41_200 },
    { label: "Nov 26", value: 40_400 },
    { label: "Nov 29", value: 41_500 },
    { label: "Dec 2", value: 40_900 },
    { label: "Dec 5", value: 41_800 },
    { label: "Dec 8", value: 41_300 },
    { label: "Dec 12", value: 42_000 },
  ],
  "3M": [
    { label: "Sep 12", value: 37_400 },
    { label: "Sep 19", value: 38_100 },
    { label: "Sep 26", value: 37_200 },
    { label: "Oct 3", value: 38_600 },
    { label: "Oct 10", value: 39_300 },
    { label: "Oct 17", value: 38_500 },
    { label: "Oct 24", value: 39_800 },
    { label: "Oct 31", value: 39_100 },
    { label: "Nov 7", value: 40_200 },
    { label: "Nov 14", value: 39_600 },
    { label: "Nov 21", value: 40_800 },
    { label: "Nov 28", value: 41_300 },
    { label: "Dec 5", value: 40_700 },
    { label: "Dec 12", value: 42_000 },
  ],
  "6M": [
    { label: "Jun 12", value: 36_800 },
    { label: "Jun 26", value: 37_600 },
    { label: "Jul 10", value: 36_900 },
    { label: "Jul 24", value: 38_200 },
    { label: "Aug 7", value: 37_500 },
    { label: "Aug 21", value: 38_900 },
    { label: "Sep 4", value: 38_200 },
    { label: "Sep 18", value: 39_500 },
    { label: "Oct 2", value: 38_800 },
    { label: "Oct 16", value: 40_100 },
    { label: "Oct 30", value: 39_400 },
    { label: "Nov 13", value: 40_900 },
    { label: "Nov 27", value: 41_100 },
    { label: "Dec 12", value: 42_000 },
  ],
  "1Y": [
    { label: "Jan", value: 28_400 },
    { label: "Feb", value: 29_800 },
    { label: "Mar", value: 29_100 },
    { label: "Apr", value: 31_000 },
    { label: "May", value: 32_400 },
    { label: "Jun", value: 31_600 },
    { label: "Jul", value: 33_900 },
    { label: "Aug", value: 35_200 },
    { label: "Sep", value: 34_400 },
    { label: "Oct", value: 37_100 },
    { label: "Nov", value: 39_600 },
    { label: "Dec", value: 42_000 },
  ],
}

const cryptoData: AccountData = {
  balance: 42_000,
  cards: [
    { id: "card-1", last4: "4291" },
    { id: "card-2", last4: "8830" },
  ],
  moneyFlowByRange: cryptoMoneyFlow,
  recentActivity: [
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
  ],
  spendingByRange: {
    "1M": [
      { id: "crypto", label: "Crypto", value: 1_207 },
      { id: "travel", label: "Travel", value: 687 },
      { id: "shopping", label: "Shopping", value: 284 },
      { id: "groceries", label: "Groceries", value: 118 },
      { id: "other", label: "Other", value: 71 },
    ],
    "3M": [
      { id: "crypto", label: "Crypto", value: 2_870 },
      { id: "travel", label: "Travel", value: 2_140 },
      { id: "shopping", label: "Shopping", value: 1_030 },
      { id: "groceries", label: "Groceries", value: 620 },
      { id: "other", label: "Other", value: 280 },
    ],
    "6M": [
      { id: "crypto", label: "Crypto", value: 5_260 },
      { id: "travel", label: "Travel", value: 4_410 },
      { id: "shopping", label: "Shopping", value: 2_270 },
      { id: "groceries", label: "Groceries", value: 1_560 },
      { id: "other", label: "Other", value: 710 },
    ],
    "1Y": [
      { id: "crypto", label: "Crypto", value: 8_910 },
      { id: "travel", label: "Travel", value: 8_350 },
      { id: "shopping", label: "Shopping", value: 5_010 },
      { id: "groceries", label: "Groceries", value: 3_900 },
      { id: "other", label: "Other", value: 1_660 },
    ],
  },
}

const everydayData: AccountData = {
  balance: 8_420,
  cards: [{ id: "card-3", last4: "5512" }],
  moneyFlowByRange: {
    "1M": [
      { label: "Nov 14", value: 7_650 },
      { label: "Nov 17", value: 8_900 },
      { label: "Nov 20", value: 8_400 },
      { label: "Nov 23", value: 8_150 },
      { label: "Nov 26", value: 7_800 },
      { label: "Nov 29", value: 9_050 },
      { label: "Dec 2", value: 8_700 },
      { label: "Dec 5", value: 8_300 },
      { label: "Dec 8", value: 8_050 },
      { label: "Dec 12", value: 8_420 },
    ],
    "3M": [
      { label: "Sep 12", value: 7_100 },
      { label: "Sep 19", value: 8_350 },
      { label: "Sep 26", value: 7_900 },
      { label: "Oct 3", value: 7_500 },
      { label: "Oct 10", value: 8_700 },
      { label: "Oct 17", value: 8_250 },
      { label: "Oct 24", value: 7_850 },
      { label: "Oct 31", value: 9_000 },
      { label: "Nov 7", value: 8_550 },
      { label: "Nov 14", value: 8_100 },
      { label: "Nov 21", value: 8_900 },
      { label: "Nov 28", value: 8_450 },
      { label: "Dec 5", value: 8_050 },
      { label: "Dec 12", value: 8_420 },
    ],
    "6M": [
      { label: "Jun 12", value: 6_400 },
      { label: "Jun 26", value: 7_600 },
      { label: "Jul 10", value: 7_150 },
      { label: "Jul 24", value: 6_800 },
      { label: "Aug 7", value: 7_950 },
      { label: "Aug 21", value: 7_500 },
      { label: "Sep 4", value: 7_100 },
      { label: "Sep 18", value: 8_250 },
      { label: "Oct 2", value: 7_800 },
      { label: "Oct 16", value: 7_400 },
      { label: "Oct 30", value: 8_500 },
      { label: "Nov 13", value: 8_100 },
      { label: "Nov 27", value: 7_750 },
      { label: "Dec 12", value: 8_420 },
    ],
    "1Y": [
      { label: "Jan", value: 5_200 },
      { label: "Feb", value: 6_400 },
      { label: "Mar", value: 5_900 },
      { label: "Apr", value: 6_800 },
      { label: "May", value: 6_300 },
      { label: "Jun", value: 7_200 },
      { label: "Jul", value: 6_700 },
      { label: "Aug", value: 7_600 },
      { label: "Sep", value: 7_100 },
      { label: "Oct", value: 7_900 },
      { label: "Nov", value: 7_500 },
      { label: "Dec", value: 8_420 },
    ],
  },
  recentActivity: [
    {
      id: "tx-5",
      name: "Salary Deposit",
      detail: "Dosshpay Pty Ltd",
      icon: PlusIcon,
      amount: 4_850.0,
    },
    {
      id: "tx-6",
      name: "Rent",
      detail: "Surry Hills apartment",
      icon: HomeIcon,
      amount: -620.0,
    },
    {
      id: "tx-7",
      name: "Woolworths",
      detail: "Town Hall Metro",
      icon: ShoppingCartIcon,
      amount: -92.45,
    },
    {
      id: "tx-8",
      name: "Netflix",
      detail: "Monthly subscription",
      icon: TvIcon,
      amount: -22.99,
    },
  ],
  spendingByRange: {
    "1M": [
      { id: "groceries", label: "Groceries", value: 640 },
      { id: "shopping", label: "Shopping", value: 480 },
      { id: "other", label: "Other", value: 210 },
      { id: "travel", label: "Travel", value: 95 },
      { id: "crypto", label: "Crypto", value: 25 },
    ],
    "3M": [
      { id: "groceries", label: "Groceries", value: 1_890 },
      { id: "shopping", label: "Shopping", value: 1_320 },
      { id: "other", label: "Other", value: 610 },
      { id: "travel", label: "Travel", value: 240 },
      { id: "crypto", label: "Crypto", value: 70 },
    ],
    "6M": [
      { id: "groceries", label: "Groceries", value: 3_720 },
      { id: "shopping", label: "Shopping", value: 2_540 },
      { id: "other", label: "Other", value: 1_180 },
      { id: "travel", label: "Travel", value: 520 },
      { id: "crypto", label: "Crypto", value: 140 },
    ],
    "1Y": [
      { id: "groceries", label: "Groceries", value: 7_150 },
      { id: "shopping", label: "Shopping", value: 4_890 },
      { id: "other", label: "Other", value: 2_310 },
      { id: "travel", label: "Travel", value: 1_060 },
      { id: "crypto", label: "Crypto", value: 260 },
    ],
  },
}

const globalData: AccountData = {
  balance: 12_940,
  cards: [{ id: "card-4", last4: "7746" }],
  moneyFlowByRange: {
    "1M": [
      { label: "Nov 14", value: 13_800 },
      { label: "Nov 17", value: 13_400 },
      { label: "Nov 20", value: 12_600 },
      { label: "Nov 23", value: 12_300 },
      { label: "Nov 26", value: 13_500 },
      { label: "Nov 29", value: 13_100 },
      { label: "Dec 2", value: 12_500 },
      { label: "Dec 5", value: 13_300 },
      { label: "Dec 8", value: 12_700 },
      { label: "Dec 12", value: 12_940 },
    ],
    "3M": [
      { label: "Sep 12", value: 11_200 },
      { label: "Sep 19", value: 12_400 },
      { label: "Sep 26", value: 11_800 },
      { label: "Oct 3", value: 13_000 },
      { label: "Oct 10", value: 12_300 },
      { label: "Oct 17", value: 11_600 },
      { label: "Oct 24", value: 12_800 },
      { label: "Oct 31", value: 12_100 },
      { label: "Nov 7", value: 13_400 },
      { label: "Nov 14", value: 12_600 },
      { label: "Nov 21", value: 13_200 },
      { label: "Nov 28", value: 12_400 },
      { label: "Dec 5", value: 13_100 },
      { label: "Dec 12", value: 12_940 },
    ],
    "6M": [
      { label: "Jun 12", value: 9_800 },
      { label: "Jun 26", value: 11_000 },
      { label: "Jul 10", value: 10_400 },
      { label: "Jul 24", value: 11_600 },
      { label: "Aug 7", value: 10_900 },
      { label: "Aug 21", value: 12_100 },
      { label: "Sep 4", value: 11_300 },
      { label: "Sep 18", value: 12_500 },
      { label: "Oct 2", value: 11_800 },
      { label: "Oct 16", value: 13_000 },
      { label: "Oct 30", value: 12_200 },
      { label: "Nov 13", value: 13_400 },
      { label: "Nov 27", value: 12_700 },
      { label: "Dec 12", value: 12_940 },
    ],
    "1Y": [
      { label: "Jan", value: 7_400 },
      { label: "Feb", value: 8_600 },
      { label: "Mar", value: 8_000 },
      { label: "Apr", value: 9_200 },
      { label: "May", value: 8_700 },
      { label: "Jun", value: 10_000 },
      { label: "Jul", value: 9_400 },
      { label: "Aug", value: 10_700 },
      { label: "Sep", value: 10_100 },
      { label: "Oct", value: 11_500 },
      { label: "Nov", value: 12_300 },
      { label: "Dec", value: 12_940 },
    ],
  },
  recentActivity: [
    {
      id: "tx-9",
      name: "FX Top-up",
      detail: "AUD → USD wallet",
      icon: ArrowLeftRightIcon,
      amount: 2_000.0,
    },
    {
      id: "tx-10",
      name: "Flight to Tokyo",
      detail: "Qantas QF25",
      icon: PlaneIcon,
      amount: -864.0,
    },
    {
      id: "tx-11",
      name: "Hotel Shibuya",
      detail: "3 nights",
      icon: HotelIcon,
      amount: -412.8,
    },
    {
      id: "tx-12",
      name: "Airport Lounge",
      detail: "Sydney T1",
      icon: CoffeeIcon,
      amount: -58.0,
    },
  ],
  spendingByRange: {
    "1M": [
      { id: "travel", label: "Travel", value: 1_540 },
      { id: "shopping", label: "Shopping", value: 420 },
      { id: "other", label: "Other", value: 260 },
      { id: "groceries", label: "Groceries", value: 180 },
      { id: "crypto", label: "Crypto", value: 40 },
    ],
    "3M": [
      { id: "travel", label: "Travel", value: 3_980 },
      { id: "shopping", label: "Shopping", value: 1_150 },
      { id: "other", label: "Other", value: 690 },
      { id: "groceries", label: "Groceries", value: 470 },
      { id: "crypto", label: "Crypto", value: 90 },
    ],
    "6M": [
      { id: "travel", label: "Travel", value: 7_260 },
      { id: "shopping", label: "Shopping", value: 2_180 },
      { id: "other", label: "Other", value: 1_240 },
      { id: "groceries", label: "Groceries", value: 830 },
      { id: "crypto", label: "Crypto", value: 150 },
    ],
    "1Y": [
      { id: "travel", label: "Travel", value: 12_400 },
      { id: "shopping", label: "Shopping", value: 3_720 },
      { id: "other", label: "Other", value: 2_150 },
      { id: "groceries", label: "Groceries", value: 1_490 },
      { id: "crypto", label: "Crypto", value: 310 },
    ],
  },
}

export const seedAccounts: Account[] = [
  { id: "crypto", kind: "crypto", label: "Crypto", data: cryptoData },
  { id: "everyday", kind: "everyday", label: "Everyday", data: everydayData },
  { id: "global", kind: "global", label: "Global", data: globalData },
]

/** Dataset for a brand-new account: $0 balance, no cards, flat money flow,
 * no activity, no spending. Widgets render their empty states from this. */
export function freshAccountData(): AccountData {
  return {
    balance: 0,
    cards: [],
    moneyFlowByRange: Object.fromEntries(
      TIME_RANGES.map((range) => [
        range,
        cryptoMoneyFlow[range].map((point) => ({ label: point.label, value: 0 })),
      ])
    ) as Record<TimeRange, SeriesPoint[]>,
    recentActivity: [],
    spendingByRange: Object.fromEntries(
      TIME_RANGES.map((range) => [range, [] as SpendingCategory[]])
    ) as Record<TimeRange, SpendingCategory[]>,
  }
}
