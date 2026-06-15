"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { addMonths, format, parseISO, startOfMonth } from "date-fns"
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { kr } from "@/lib/format"
import type { Installment, RepaymentPlan } from "@/lib/plan-types"
import { savePlan } from "@/app/plan/actions"

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const nextMonthFirst = () =>
  format(startOfMonth(addMonths(new Date(), 1)), "yyyy-MM-dd")

export function PlanBuilder({
  outstanding,
  partnerName,
  initialPlan,
}: {
  outstanding: number
  partnerName: string
  initialPlan: RepaymentPlan | null
}) {
  const [rows, setRows] = React.useState<Installment[]>(
    initialPlan?.installments.length
      ? initialPlan.installments
      : [{ id: uid(), date: nextMonthFirst(), amount: 0 }]
  )
  const [note, setNote] = React.useState(initialPlan?.note ?? "")
  const [months, setMonths] = React.useState(3)
  const [startDate, setStartDate] = React.useState(nextMonthFirst())
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const diff = Math.round((total - outstanding) * 100) / 100

  function generate() {
    const n = Math.max(1, Math.min(36, Math.round(months)))
    const per = Math.floor(outstanding / n)
    const start = parseISO(startDate)
    const next: Installment[] = Array.from({ length: n }, (_, i) => ({
      id: uid(),
      date: format(addMonths(start, i), "yyyy-MM-dd"),
      amount:
        i === n - 1
          ? Math.round((outstanding - per * (n - 1)) * 100) / 100
          : per,
    }))
    setRows(next)
    setError(null)
  }

  function updateRow(id: string, patch: Partial<Installment>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addRow() {
    const lastDate = rows.length ? rows[rows.length - 1].date : nextMonthFirst()
    setRows((rs) => [
      ...rs,
      { id: uid(), date: format(addMonths(parseISO(lastDate), 1), "yyyy-MM-dd"), amount: 0 },
    ])
  }

  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  function save() {
    setError(null)
    const valid = rows.filter((r) => r.date && Number(r.amount) > 0)
    if (valid.length === 0) {
      return setError("Lägg till minst en delbetalning med datum och belopp.")
    }
    const fd = new FormData()
    fd.set("installments", JSON.stringify(valid))
    fd.set("note", note)
    startTransition(async () => {
      try {
        await savePlan(fd)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunde inte spara planen.")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="rounded-sm border border-dashed bg-muted/30 p-4">
        <div className="kicker mb-3 flex items-center gap-2 text-muted-foreground">
          <Wand2 className="size-3.5" /> Snabbgenerera
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Dela upp {kr(outstanding)} i lika stora månadsbetalningar.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="gen-months" className="text-xs">Antal månader</Label>
            <Input
              id="gen-months"
              type="number"
              min={1}
              max={36}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-28"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gen-start" className="text-xs">Första betalning</Label>
            <Input
              id="gen-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-44"
            />
          </div>
          <Button type="button" variant="secondary" onClick={generate}>
            <Wand2 /> Generera
          </Button>
        </div>
      </div>

      {/* Rader */}
      <div className="space-y-2">
        <div className="kicker text-muted-foreground">Delbetalningar</div>
        {rows.map((row, i) => (
          <div key={row.id} className="flex items-center gap-2">
            <span className="font-display w-6 shrink-0 text-center text-lg text-muted-foreground">
              {i + 1}
            </span>
            <Input
              type="date"
              value={row.date}
              onChange={(e) => updateRow(row.id, { date: e.target.value })}
              className="flex-1"
            />
            <div className="relative w-32 shrink-0">
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={row.amount || ""}
                onChange={(e) => updateRow(row.id, { amount: Number(e.target.value) })}
                placeholder="0"
                className="pr-8 text-right"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                kr
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Ta bort rad"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={addRow} className="kicker">
          <Plus /> Lägg till rad
        </Button>
      </div>

      {/* Summering */}
      <div className="flex items-center justify-between rounded-sm border bg-card p-4">
        <div>
          <div className="kicker text-muted-foreground">Planens summa</div>
          <div className="font-display text-2xl tabular-nums">{kr(total)}</div>
        </div>
        <div className="text-right text-sm">
          {Math.abs(diff) < 0.5 ? (
            <span className="text-emerald-700 dark:text-emerald-400">
              Täcker hela saldot ({kr(outstanding)})
            </span>
          ) : diff < 0 ? (
            <span className="text-brand">Saknar {kr(Math.abs(diff))} av saldot</span>
          ) : (
            <span className="text-muted-foreground">{kr(diff)} mer än saldot</span>
          )}
        </div>
      </div>

      {/* Villkor */}
      <div className="space-y-2">
        <Label htmlFor="plan-note">Villkor / överenskommelse</Label>
        <Textarea
          id="plan-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={`T.ex. "${partnerName} betalar via Swish senast den 1:a varje månad. Vid utebliven betalning hör vi av oss till varandra."`}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={save} disabled={pending} className="w-full">
        {pending && <Loader2 className="animate-spin" />}
        Spara plan
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        När planen är sparad kan {partnerName} skriva under den nedan.
      </p>
    </div>
  )
}
