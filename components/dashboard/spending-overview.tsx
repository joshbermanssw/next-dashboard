"use client"

import { Label, Pie, PieChart } from "recharts"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RangeSelector } from "@/components/ui/range-selector"
import {
  spendingByCategory,
  type SpendingCategoryId,
} from "@/lib/dashboard-data"
import { formatCurrency } from "@/lib/utils"

/** Fixed slot order from the validated categorical palette in globals.css. */
const CATEGORY_COLORS: Record<SpendingCategoryId, string> = {
  crypto: "var(--color-chartMagenta)",
  travel: "var(--color-chartPeriwinkle)",
  shopping: "var(--color-chartSalmon)",
  groceries: "var(--color-chartBlue)",
  other: "var(--color-chartLime)",
}

const chartConfig = Object.fromEntries(
  spendingByCategory.map((c) => [
    c.id,
    { label: c.label, color: CATEGORY_COLORS[c.id] },
  ])
) satisfies ChartConfig

const chartData = spendingByCategory.map((c) => ({
  ...c,
  fill: CATEGORY_COLORS[c.id],
}))

const total = spendingByCategory.reduce((sum, c) => sum + c.value, 0)

export function SpendingOverview() {
  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader>
        <PanelTitle>Spending Overview</PanelTitle>
        <RangeSelector />
      </PanelHeader>

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
          {spendingByCategory.map((c) => (
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
    </Panel>
  )
}
