"use client"

import { TrendingUpIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RangeSelector } from "@/components/ui/range-selector"
import { moneyFlow, moneyFlowChange } from "@/lib/dashboard-data"
import { formatCompact, formatCurrency } from "@/lib/utils"

const chartConfig = {
  value: { label: "Balance", color: "var(--color-accentBlue)" },
} satisfies ChartConfig

export function MoneyFlow() {
  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader>
        <div className="flex flex-col gap-1.5">
          <PanelTitle>Money Flow</PanelTitle>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-positive">
            <TrendingUpIcon className="size-3.5" />+{moneyFlowChange}%
          </span>
        </div>
        <RangeSelector />
      </PanelHeader>

      <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
        <AreaChart data={moneyFlow} margin={{ left: 4, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="moneyFlowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accentBlue)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-accentBlue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-panel-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={16}
            tick={{ fill: "var(--color-label)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(v) => formatCompact(Number(v))}
            tick={{ fill: "var(--color-label)", fontSize: 11 }}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--color-panel-border)" }}
            content={
              <ChartTooltipContent
                labelClassName="text-card-foreground"
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-accentBlue)"
            strokeWidth={2}
            fill="url(#moneyFlowFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  )
}
