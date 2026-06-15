import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, balanceOf } from "@/lib/fifo"
import {
  computeStats,
  balanceSeries,
  monthlySeries,
  categoryBreakdown,
} from "@/lib/stats"
import { AppShell } from "@/components/app-shell"
import { NoBook } from "@/components/no-book"
import { StatCards } from "@/components/stat-cards"
import { StatsCharts } from "@/components/stats-charts"

export const dynamic = "force-dynamic"

export default async function StatsPage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const allocated = allocate(debts, payments)
  const balance = balanceOf(allocated)
  const stats = computeStats(allocated, payments, balance)

  return (
    <AppShell partnerName={book.partner_name}>
      <h1 className="mb-4 text-lg font-semibold">Statistik</h1>
      <div className="space-y-5">
        <StatCards stats={stats} />
        <StatsCharts
          balance={balanceSeries(allocated, payments)}
          monthly={monthlySeries(allocated)}
          categories={categoryBreakdown(allocated)}
        />
      </div>
    </AppShell>
  )
}
