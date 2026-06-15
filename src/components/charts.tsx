"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

import { shortDate, kr, num } from "@/lib/format"
import { CATEGORY_META } from "@/lib/constants"
import type { Category } from "@/lib/types"

const axisStyle = { fontSize: 11, fill: "var(--muted-foreground)" }

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {children}
    </div>
  )
}

export function BalanceChart({
  data,
}: {
  data: { date: string; saldo: number }[]
}) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) => num(v)}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TipBox>
                <div className="font-medium">{shortDate(String(label))}</div>
                <div>{kr(Number(payload[0].value))}</div>
              </TipBox>
            ) : null
          }
        />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MonthlyChart({
  data,
}: {
  data: { month: string; belopp: number }[]
}) {
  if (data.length === 0) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(m: string) => m.split(" ")[0].slice(0, 3)}
        />
        <YAxis
          tickFormatter={(v) => num(v)}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TipBox>
                <div className="font-medium capitalize">{String(label)}</div>
                <div>{kr(Number(payload[0].value))}</div>
              </TipBox>
            ) : null
          }
        />
        <Bar dataKey="belopp" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryChart({
  data,
}: {
  data: { category: Category; total: number }[]
}) {
  if (data.length === 0) return <Empty />
  const total = data.reduce((s, d) => s + d.total, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[260px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.category} fill={CATEGORY_META[d.category].color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TipBox>
                  <div className="font-medium">{payload[0].name}</div>
                  <div>{kr(Number(payload[0].value))}</div>
                </TipBox>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-1.5">
        {data
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((d) => (
            <li key={d.category} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_META[d.category].color }}
              />
              <span className="flex-1">{d.category}</span>
              <span className="font-medium tabular-nums">{kr(d.total)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {Math.round((d.total / total) * 100)}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
      Ingen data ännu
    </div>
  )
}
