import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { kr } from "@/lib/format"

export function BalanceCard({
  balance,
  partnerName,
}: {
  balance: number
  partnerName: string
}) {
  const settled = Math.abs(balance) < 0.5
  const theyOwe = balance > 0

  const tone = settled
    ? "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30"
    : theyOwe
      ? "from-red-500/15 to-red-500/5 border-red-500/30"
      : "from-blue-500/15 to-blue-500/5 border-blue-500/30"

  const label = settled
    ? "Allt är reglerat"
    : theyOwe
      ? `${partnerName} är skyldig mig`
      : `Jag är skyldig ${partnerName}`

  const accent = settled
    ? "text-emerald-600 dark:text-emerald-400"
    : theyOwe
      ? "text-red-600 dark:text-red-400"
      : "text-blue-600 dark:text-blue-400"

  const Icon = settled ? CheckCircle2 : theyOwe ? ArrowUpRight : ArrowDownRight

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm sm:p-8",
        tone
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className={cn("size-4", accent)} />
        {label}
      </div>
      <div className={cn("mt-3 text-5xl font-bold tracking-tight tabular-nums sm:text-6xl", accent)}>
        {settled ? kr(0) : kr(Math.abs(balance))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {settled
          ? "Inga utestående skulder just nu."
          : "Aktuellt utestående saldo."}
      </p>
    </div>
  )
}
