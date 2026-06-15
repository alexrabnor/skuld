import { ArrowUp, ArrowDown, Sigma } from "lucide-react"
import { kr, monthLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

export function MonthSummary({
  lent,
  repaid,
  net,
}: {
  lent: number
  repaid: number
  net: number
}) {
  const month = monthLabel(new Date().toISOString())
  return (
    <div className="rounded-sm border bg-card p-5 shadow-sm">
      <p className="kicker mb-3 border-b pb-3 capitalize text-muted-foreground">
        {month}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Cell icon={ArrowUp} label="Utlånat" value={kr(lent)} tone="text-brand" />
        <Cell
          icon={ArrowDown}
          label="Återbetalat"
          value={kr(repaid)}
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <Cell
          icon={Sigma}
          label="Netto"
          value={(net >= 0 ? "+" : "") + kr(net)}
          tone={net >= 0 ? "text-brand" : "text-foreground"}
        />
      </div>
    </div>
  )
}

function Cell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="rounded-sm bg-muted/50 p-3 text-center">
      <Icon className={cn("mx-auto size-4", tone)} />
      <div className="font-display mt-1.5 text-xl tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
