"use client"

import * as React from "react"
import { ChartPieIcon } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RangeSelector } from "@/components/ui/range-selector"
import { useAccounts } from "@/contexts/accounts-context"
import type { SpendingCategoryId, TimeRange } from "@/lib/dashboard-data"
import { formatCurrency } from "@/lib/utils"

/** Fixed slot order from the validated categorical palette in globals.css.
 * Colour follows the category, never its rank — the mapping is identical in
 * every time window. */
const CATEGORY_COLORS: Record<SpendingCategoryId, string> = {
  crypto: "var(--color-chartMagenta)",
  travel: "var(--color-chartPeriwinkle)",
  shopping: "var(--color-chartSalmon)",
  groceries: "var(--color-chartBlue)",
  other: "var(--color-chartLime)",
}

const chartConfig = {
  crypto: { label: "Crypto", color: CATEGORY_COLORS.crypto },
  travel: { label: "Travel", color: CATEGORY_COLORS.travel },
  shopping: { label: "Shopping", color: CATEGORY_COLORS.shopping },
  groceries: { label: "Groceries", color: CATEGORY_COLORS.groceries },
  other: { label: "Other", color: CATEGORY_COLORS.other },
} satisfies ChartConfig

export function SpendingOverview() {
  const { selected } = useAccounts()
  const [range, setRange] = React.useState<TimeRange>("1M")
  const categories = selected.data.spendingByRange[range]
  const total = categories.reduce((sum, c) => sum + c.value, 0)
  const chartData = categories.map((c) => ({
    ...c,
    fill: CATEGORY_COLORS[c.id],
  }))

  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader>
        <PanelTitle>Spending Overview</PanelTitle>
        <RangeSelector defaultRange="1M" onRangeChange={setRange} />
      </PanelHeader>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5">
            <ChartPieIcon className="size-5 text-label" aria-hidden />
          </span>
          <span className="text-sm text-label">No spending yet</span>
        </div>
      ) : (
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-44 shrink-0"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ background: item?.payload?.fill }}
                      />
                      <span className="text-muted-foreground">{name}</span>
                      <span className="ml-auto font-medium tabular-nums text-foreground">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="transparent"
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                    return null
                  }
                  const cx = viewBox.cx ?? 0
                  const cy = viewBox.cy ?? 0
                  return (
                    <text x={cx} y={cy} textAnchor="middle">
                      <tspan
                        x={cx}
                        y={cy - 10}
                        className="fill-label text-xs font-medium tracking-wide"
                      >
                        AUD
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 12}
                        className="fill-blueLightest text-xl font-semibold"
                      >
                        {total.toLocaleString("en-AU")}
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="flex w-full flex-col gap-3">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[c.id] }}
              />
              <span className="font-medium text-blueLight">{c.label}</span>
              <span className="ml-auto tabular-nums text-label">
                {Math.round((c.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      )}
    </Panel>
  )
}
