"use client"

import * as React from "react"
import {
  MdApartment,
  MdAttachMoney,
  MdAutorenew,
  MdBolt,
  MdDirectionsCar,
  MdFavorite,
  MdGroups,
  MdHome,
  MdPayments,
  MdPerson,
  MdPublic,
  MdSavings,
  MdShoppingCart,
  MdTrendingUp,
  MdVerified,
  MdAccountBalance,
} from "react-icons/md"
import {
  SectionSteps,
  type StepDefinition,
} from "@/components/kyc/section-steps"
import {
  MultiSelectList,
  SingleSelectList,
  toOptions,
} from "@/components/kyc/option-list"
import type { KycSectionProps } from "@/components/kyc/types"
import { FundsSectionSchema } from "@/lib/kyc"
import {
  ACTIVITIES,
  ACTIVITY_LABELS,
  INCOME_BAND_LABELS,
  INCOME_BANDS,
  INCOME_SOURCE_LABELS,
  INCOME_SOURCES,
  INDUSTRIES,
  INDUSTRY_LABELS,
  OCCUPATION_LABELS,
  OCCUPATIONS,
  TRANSACTION_COUNTRIES,
  TRANSACTION_COUNTRY_LABELS,
  type Activity,
  type IncomeBand,
  type IncomeSource,
  type Industry,
  type Occupation,
  type TransactionCountry,
} from "@/lib/kyc-options"

const INCOME_SOURCE_ICONS: Record<IncomeSource, React.ReactNode> = {
  "sales-revenue": <MdShoppingCart />,
  "recurring-revenue": <MdAutorenew />,
  freelance: <MdPerson />,
  investment: <MdTrendingUp />,
  rental: <MdHome />,
  licensing: <MdVerified />,
  "government-grants": <MdAccountBalance />,
  salary: <MdPayments />,
}

const ACTIVITY_ICONS: Record<Activity, React.ReactNode> = {
  "bills-utilities": <MdBolt />,
  "business-transactions": <MdApartment />,
  "car-payments": <MdDirectionsCar />,
  "charity-donations": <MdFavorite />,
  ecommerce: <MdShoppingCart />,
  "international-transfers": <MdPublic />,
  payroll: <MdGroups />,
  "everyday-spending": <MdPayments />,
  "savings-investment": <MdSavings />,
}

type Draft = {
  incomeSources: IncomeSource[]
  annualIncome: IncomeBand | null
  industry: Industry | null
  occupation: Occupation | null
  activities: Activity[]
  transactionCountries: TransactionCountry[]
}

function draftFrom(initial: KycSectionProps<"funds">["initial"]): Draft {
  return {
    incomeSources: initial?.incomeSources ?? [],
    annualIncome: initial?.annualIncome ?? null,
    industry: initial?.industry ?? null,
    occupation: initial?.occupation ?? null,
    activities: initial?.activities ?? [],
    transactionCountries: initial?.transactionCountries ?? [],
  }
}

/**
 * Source of Funds — where the money comes from and what it will be used for.
 *
 * This is the AML half of the check: the answers feed transaction monitoring,
 * so the activity and country lists are the ones the risk rules are written
 * against rather than free text.
 */
export function FundsSection({
  initial,
  closeHref,
  onSubmit,
  pending,
  error,
}: KycSectionProps<"funds">) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(initial))
  const [invalid, setInvalid] = React.useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const steps: StepDefinition[] = [
    {
      title: "Income Sources",
      subtitle: "What are your sources of income? Select all that apply.",
      canContinue: draft.incomeSources.length > 0,
      content: (
        <MultiSelectList
          label="Income sources"
          options={toOptions(INCOME_SOURCES, INCOME_SOURCE_LABELS, {
            icon: (value) => INCOME_SOURCE_ICONS[value],
          })}
          values={draft.incomeSources}
          onChange={(v) => set("incomeSources", v)}
        />
      ),
    },
    {
      title: "Annual Income",
      subtitle: "Tell us about your yearly income.",
      canContinue: draft.annualIncome !== null,
      content: (
        <SingleSelectList
          label="Annual income"
          options={toOptions(INCOME_BANDS, INCOME_BAND_LABELS, {
            icon: () => <MdAttachMoney />,
          })}
          value={draft.annualIncome}
          onChange={(v) => set("annualIncome", v)}
        />
      ),
    },
    {
      title: "Industry",
      subtitle: "What industry do you work in?",
      canContinue: draft.industry !== null,
      content: (
        <SingleSelectList
          label="Industry"
          searchPlaceholder="Search industries"
          options={toOptions(INDUSTRIES, INDUSTRY_LABELS, {
            icon: () => <MdApartment />,
          })}
          value={draft.industry}
          onChange={(v) => set("industry", v)}
        />
      ),
    },
    {
      title: "Occupation",
      subtitle: "What is your occupation?",
      canContinue: draft.occupation !== null,
      content: (
        <SingleSelectList
          label="Occupation"
          searchPlaceholder="Search occupations"
          options={toOptions(OCCUPATIONS, OCCUPATION_LABELS, {
            icon: () => <MdPerson />,
          })}
          value={draft.occupation}
          onChange={(v) => set("occupation", v)}
        />
      ),
    },
    {
      title: "Dossh Activities",
      subtitle:
        "What activities will you use DosshPay for? Select all that apply.",
      canContinue: draft.activities.length > 0,
      content: (
        <MultiSelectList
          label="Activities"
          options={toOptions(ACTIVITIES, ACTIVITY_LABELS, {
            icon: (value) => ACTIVITY_ICONS[value],
          })}
          values={draft.activities}
          onChange={(v) => set("activities", v)}
        />
      ),
    },
    {
      title: "Transaction Countries",
      subtitle: "Which countries will you transact with? Select all that apply.",
      canContinue: draft.transactionCountries.length > 0,
      content: (
        <MultiSelectList
          label="Transaction countries"
          searchPlaceholder="Search countries"
          options={toOptions(
            TRANSACTION_COUNTRIES,
            TRANSACTION_COUNTRY_LABELS,
          )}
          values={draft.transactionCountries}
          onChange={(v) => set("transactionCountries", v)}
        />
      ),
    },
  ]

  const complete = () => {
    const parsed = FundsSectionSchema.safeParse({
      ...draft,
      annualIncome: draft.annualIncome ?? undefined,
      industry: draft.industry ?? undefined,
      occupation: draft.occupation ?? undefined,
    })

    if (!parsed.success) {
      setInvalid(parsed.error.issues[0]?.message ?? "Check your answers.")
      return
    }

    setInvalid(null)
    onSubmit(parsed.data)
  }

  return (
    <SectionSteps
      steps={steps}
      closeHref={closeHref}
      pending={pending}
      error={invalid ?? error}
      onComplete={complete}
    />
  )
}
