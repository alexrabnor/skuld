import { ArrowDownLeft, Flag } from "lucide-react"

import { CategoryIcon } from "@/components/category-icon"
import { Badge } from "@/components/ui/badge"
import { kr, longDate, STATUS_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { LedgerEvent } from "@/lib/types"

const STATUS_VARIANT = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
} as const

export function Timeline({
  events,
  balance,
  partnerName,
}: {
  events: LedgerEvent[]
  balance: number
  partnerName: string
}) {
  // kronologiskt: äldst först
  const chrono = [...events].reverse()
  const settled = Math.abs(balance) < 0.5
  const theyOwe = balance > 0

  if (chrono.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Inga händelser ännu.
      </div>
    )
  }

  return (
    <ol className="relative ml-4 border-l border-border pl-6">
      {chrono.map((e) => {
        const isDebt = e.kind === "debt"
        return (
          <li key={`${e.kind}-${e.id}`} className="relative pb-6">
            <span className="absolute -left-[33px] top-0.5 ring-4 ring-background">
              {isDebt ? (
                <CategoryIcon category={e.category} />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15">
                  <ArrowDownLeft className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                </span>
              )}
            </span>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {isDebt ? e.description || e.category : "Återbetalning"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {longDate(e.date)} · {isDebt ? e.category : e.method}
                </p>
                {isDebt && (
                  <Badge variant={STATUS_VARIANT[e.status]} className="mt-1">
                    {STATUS_LABEL[e.status]}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  !isDebt
                    ? "text-emerald-600 dark:text-emerald-400"
                    : e.direction === "they_owe"
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                )}
              >
                {isDebt ? "+" : "−"}
                {kr(e.amount)}
              </span>
            </div>
          </li>
        )
      })}

      <li className="relative">
        <span className="absolute -left-[33px] top-0.5 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
          <Flag className="size-4.5" />
        </span>
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Nuvarande saldo</p>
          <p
            className={cn(
              "text-lg font-bold tabular-nums",
              settled
                ? "text-emerald-600 dark:text-emerald-400"
                : theyOwe
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
            )}
          >
            {settled
              ? "Allt reglerat"
              : theyOwe
                ? `${partnerName} är skyldig mig ${kr(Math.abs(balance))}`
                : `Jag är skyldig ${partnerName} ${kr(Math.abs(balance))}`}
          </p>
        </div>
      </li>
    </ol>
  )
}
