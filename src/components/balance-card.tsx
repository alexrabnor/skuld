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
    ? "from-emerald-700/10 to-transparent border-emerald-700/25"
    : theyOwe
      ? "from-brand/15 to-transparent border-brand/30"
      : "from-stone-500/10 to-transparent border-border"

  const label = settled
    ? "Allt är reglerat"
    : theyOwe
      ? `${partnerName} är skyldig mig`
      : `Jag är skyldig ${partnerName}`

  const accent = settled
    ? "text-emerald-700 dark:text-emerald-400"
    : theyOwe
      ? "text-brand"
      : "text-foreground"

  const Icon = settled ? CheckCircle2 : theyOwe ? ArrowUpRight : ArrowDownRight

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border bg-gradient-to-br p-6 shadow-sm sm:p-9",
        tone
      )}
    >
      <div className="kicker flex items-center gap-2 text-muted-foreground">
        <Icon className={cn("size-3.5", accent)} />
        {label}
      </div>
      <div
        className={cn(
          "font-display mt-4 text-6xl tabular-nums sm:text-7xl",
          accent
        )}
      >
        {settled ? kr(0) : kr(Math.abs(balance))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {settled
          ? "Inga utestående skulder just nu."
          : "Aktuellt utestående saldo."}
      </p>
    </div>
  )
}
