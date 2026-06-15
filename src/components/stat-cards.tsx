import {
  TrendingUp,
  Wallet,
  Repeat,
  Hash,
  CalendarRange,
  Crown,
  Trophy,
} from "lucide-react"
import { kr } from "@/lib/format"
import type { Stats } from "@/lib/stats"

function Tile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function StatCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Tile icon={TrendingUp} label="Totalt utlånat" value={kr(stats.totalLent)} />
      <Tile icon={Repeat} label="Totalt återbetalat" value={kr(stats.totalRepaid)} />
      <Tile icon={Wallet} label="Nuvarande skuld" value={kr(stats.balance)} />
      <Tile icon={Hash} label="Antal transaktioner" value={String(stats.txCount)} />
      <Tile
        icon={CalendarRange}
        label="Snitt per månad"
        value={kr(stats.avgPerMonth)}
      />
      <Tile
        icon={Crown}
        label="Största utlägg"
        value={stats.biggest ? kr(stats.biggest.amount) : "–"}
        sub={stats.biggest?.description || stats.biggest?.category}
      />
      <Tile
        icon={Trophy}
        label="Mest använda kategori"
        value={stats.topCategory?.category ?? "–"}
        sub={stats.topCategory ? kr(stats.topCategory.total) : undefined}
      />
    </div>
  )
}
