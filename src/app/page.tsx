import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, balanceOf, buildLedger } from "@/lib/fifo"
import { thisMonthSummary } from "@/lib/stats"
import { AppShell } from "@/components/app-shell"
import { NoBook } from "@/components/no-book"
import { BalanceCard } from "@/components/balance-card"
import { MonthSummary } from "@/components/month-summary"
import { TransactionList } from "@/components/transaction-list"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const allocated = allocate(debts, payments)
  const balance = balanceOf(allocated)
  const ledger = buildLedger(allocated, payments)
  const month = thisMonthSummary(allocated, payments)

  return (
    <AppShell partnerName={book.partner_name}>
      <div className="space-y-5">
        <BalanceCard balance={balance} partnerName={book.partner_name} />

        <MonthSummary lent={month.lent} repaid={month.repaid} net={month.net} />

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Senaste transaktioner</h2>
            <Link
              href="/transaktioner"
              className="flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              Visa alla <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <TransactionList
            events={ledger.slice(0, 5)}
            partnerName={book.partner_name}
            empty="Inga transaktioner ännu. Tryck på + för att lägga till."
          />
        </section>
      </div>
    </AppShell>
  )
}
