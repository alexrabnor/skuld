"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TransactionItem } from "@/components/transaction-item"
import { CATEGORIES } from "@/lib/constants"
import { monthLabel, monthKey } from "@/lib/format"
import type { LedgerEvent } from "@/lib/types"

export interface ViewItem {
  event: LedgerEvent
  receiptUrl?: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "Alla statusar" },
  { value: "unpaid", label: "Ej återbetald" },
  { value: "partial", label: "Delvis återbetald" },
  { value: "paid", label: "Helt återbetald" },
]

export function TransactionsView({
  items,
  partnerName,
}: {
  items: ViewItem[]
  partnerName: string
}) {
  const [q, setQ] = React.useState("")
  const [period, setPeriod] = React.useState("all")
  const [category, setCategory] = React.useState("all")
  const [status, setStatus] = React.useState("all")

  const months = React.useMemo(() => {
    const keys = new Set(items.map((i) => monthKey(i.event.date)))
    return [...keys].sort((a, b) => b.localeCompare(a))
  }, [items])

  const filtered = items.filter(({ event }) => {
    if (period !== "all" && monthKey(event.date) !== period) return false

    const isDebt = event.kind === "debt"
    if (category !== "all" && (!isDebt || event.category !== category)) return false
    if (status !== "all" && (!isDebt || event.status !== status)) return false

    if (q.trim()) {
      const hay = (
        isDebt
          ? `${event.description} ${event.category} ${event.payment_method} ${event.note ?? ""} ${event.amount}`
          : `återbetalning ${event.method} ${event.comment ?? ""} ${event.amount}`
      ).toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  const active = q || period !== "all" || category !== "all" || status !== "all"

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sök datum, belopp, kategori, beskrivning…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="all">Alla perioder</option>
          {months.map((m) => (
            <option key={m} value={m} className="capitalize">
              {monthLabel(m + "-01")}
            </option>
          ))}
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Alla kategorier</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>{filtered.length} träffar</span>
        {active && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setQ("")
              setPeriod("all")
              setCategory("all")
              setStatus("all")
            }}
          >
            <X /> Rensa filter
          </Button>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-2 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Inga transaktioner matchar.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map(({ event, receiptUrl }) => (
              <TransactionItem
                key={`${event.kind}-${event.id}`}
                event={event}
                partnerName={partnerName}
                receiptUrl={receiptUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
