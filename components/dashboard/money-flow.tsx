"use client"

import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RangeSelector } from "@/components/ui/range-selector"
import { moneyFlowByRange, type TimeRange } from "@/lib/dashboard-data"
import { cn, formatCompact, formatCurrency } from "@/lib/utils"

const chartConfig = {
  value: { label: "Balance", color: "var(--color-accentBlue)" },
} satisfies ChartConfig

export function MoneyFlow() {
  const [range, setRange] = React.useState<TimeRange>("6M")
  const data = moneyFlowByRange[range]

  const first = data[0].value
  const last = data[data.length - 1].value
  const change = ((last - first) / first) * 100
  const TrendIcon = change < 0 ? TrendingDownIcon : TrendingUpIcon

  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader>
        <div className="flex flex-col gap-1.5">
          <PanelTitle>Money Flow</PanelTitle>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium",
              change < 0 ? "text-negative" : "text-positive"
            )}
          >
            <TrendIcon className="size-3.5" />
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        </div>
        <RangeSelector defaultRange="6M" onRangeChange={setRange} />
      </PanelHeader>

      <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
        <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
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
