import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, balanceOf, buildLedger } from "@/lib/fifo"
import { AppShell } from "@/components/app-shell"
import { NoBook } from "@/components/no-book"
import { Timeline } from "@/components/timeline"

export const dynamic = "force-dynamic"

export default async function TimelinePage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const allocated = allocate(debts, payments)
  const balance = balanceOf(allocated)
  const ledger = buildLedger(allocated, payments)

  return (
    <AppShell partnerName={book.partner_name}>
      <h1 className="mb-6 text-lg font-semibold">Tidslinje</h1>
      <Timeline events={ledger} balance={balance} partnerName={book.partner_name} />
    </AppShell>
  )
}
