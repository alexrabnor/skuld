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
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium capitalize text-muted-foreground">
        {month}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Cell icon={ArrowUp} label="Utlånat" value={kr(lent)} tone="text-red-500" />
        <Cell
          icon={ArrowDown}
          label="Återbetalat"
          value={kr(repaid)}
          tone="text-emerald-500"
        />
        <Cell
          icon={Sigma}
          label="Netto"
          value={(net >= 0 ? "+" : "") + kr(net)}
          tone={net >= 0 ? "text-red-500" : "text-blue-500"}
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
    <div className="rounded-xl bg-muted/40 p-3 text-center">
      <Icon className={cn("mx-auto size-4", tone)} />
      <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  )
}
