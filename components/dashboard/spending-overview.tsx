"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RangeSelector } from "@/components/ui/range-selector"
import { spendingOverview } from "@/lib/dashboard-data"
import { formatCompact, formatCurrency } from "@/lib/utils"

const chartConfig = {
  value: { label: "Spending", color: "var(--color-accentBlue)" },
} satisfies ChartConfig

export function SpendingOverview() {
  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader>
        <PanelTitle>Spending Overview</PanelTitle>
        <RangeSelector />
      </PanelHeader>

      <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
        <BarChart data={spendingOverview} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accentBlue)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--color-accentBlue)" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-panel-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: "var(--color-label)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => formatCompact(Number(v))}
            tick={{ fill: "var(--color-label)", fontSize: 11 }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--color-panel-hover)" }}
            content={
              <ChartTooltipContent
                labelClassName="text-card-foreground"
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Bar
            dataKey="value"
            fill="url(#spendingFill)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}
