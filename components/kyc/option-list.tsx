"use client"

import * as React from "react"
import { MdSearch } from "react-icons/md"
import {
  SelectableCard,
  SelectionIndicator,
} from "@/components/onboarding/selectable-card"
import { Input } from "@/components/ui/input"

export type Option<V extends string> = {
  value: V
  label: string
  /** Secondary line under the label. */
  hint?: string
  icon?: React.ReactNode
}

/**
 * Turns a `const` value tuple plus its label record into option rows. Keeps the
 * catalogues in `lib/kyc-options.ts` as the single source of order and wording.
 */
export function toOptions<V extends string>(
  values: readonly V[],
  labels: Record<V, string>,
  extras?: { hints?: Record<V, string>; icon?: (value: V) => React.ReactNode },
): Option<V>[] {
  return values.map((value) => ({
    value,
    label: labels[value],
    hint: extras?.hints?.[value],
    icon: extras?.icon?.(value),
  }))
}

function useFiltered<V extends string>(options: Option<V>[], query: string) {
  return React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])
}

function SearchBox({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <MdSearch
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-blueLight/50"
      />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className="pl-10"
      />
    </div>
  )
}

/**
 * One option card. Rows with an icon put it on the left and the tick on the
 * right (the catalogue lists); rows without lead with the tick (the short
 * either/or questions), matching the mobile flow.
 */
function OptionRow<V extends string>({
  option,
  selected,
  shape,
  onSelect,
}: {
  option: Option<V>
  selected: boolean
  shape: "circle" | "square"
  onSelect: () => void
}) {
  return (
    <SelectableCard
      role={shape === "circle" ? "radio" : "checkbox"}
      selected={selected}
      onSelect={onSelect}
      className="items-center"
    >
      {option.icon ? (
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blueLight"
        >
          {option.icon}
        </span>
      ) : (
        <SelectionIndicator selected={selected} shape={shape} />
      )}

      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium text-blueLightest">{option.label}</span>
        {option.hint ? (
          <span className="text-sm text-blueLight">{option.hint}</span>
        ) : null}
      </span>

      {option.icon ? (
        <SelectionIndicator selected={selected} shape={shape} />
      ) : null}
    </SelectableCard>
  )
}

type ListProps<V extends string> = {
  options: Option<V>[]
  label: string
  /** Renders a filter box above the list. */
  searchPlaceholder?: string
}

/** Pick exactly one. */
export function SingleSelectList<V extends string>({
  options,
  label,
  searchPlaceholder,
  value,
  onChange,
}: ListProps<V> & { value: V | null; onChange: (value: V) => void }) {
  const [query, setQuery] = React.useState("")
  const visible = useFiltered(options, query)

  return (
    <div className="flex flex-col gap-3">
      {searchPlaceholder ? (
        <SearchBox
          placeholder={searchPlaceholder}
          value={query}
          onChange={setQuery}
        />
      ) : null}

      <div role="radiogroup" aria-label={label} className="flex flex-col gap-3">
        {visible.map((option) => (
          <OptionRow
            key={option.value}
            option={option}
            selected={value === option.value}
            shape="circle"
            onSelect={() => onChange(option.value)}
          />
        ))}
        {visible.length === 0 ? <EmptyResult /> : null}
      </div>
    </div>
  )
}

/** Pick any number. */
export function MultiSelectList<V extends string>({
  options,
  label,
  searchPlaceholder,
  values,
  onChange,
}: ListProps<V> & { values: V[]; onChange: (values: V[]) => void }) {
  const [query, setQuery] = React.useState("")
  const visible = useFiltered(options, query)

  const toggle = (value: V) =>
    onChange(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    )

  return (
    <div className="flex flex-col gap-3">
      {searchPlaceholder ? (
        <SearchBox
          placeholder={searchPlaceholder}
          value={query}
          onChange={setQuery}
        />
      ) : null}

      <div aria-label={label} role="group" className="flex flex-col gap-3">
        {visible.map((option) => (
          <OptionRow
            key={option.value}
            option={option}
            selected={values.includes(option.value)}
            shape="square"
            onSelect={() => toggle(option.value)}
          />
        ))}
        {visible.length === 0 ? <EmptyResult /> : null}
      </div>
    </div>
  )
}

function EmptyResult() {
  return (
    <p className="rounded-xl border border-panel-border bg-white/5 p-4 text-sm text-blueLight">
      Nothing matches that search.
    </p>
  )
}
