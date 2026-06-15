import { Download } from "lucide-react"

import { requireAuth, loadBookData, assetUrl } from "@/lib/directus"
import { allocate, buildLedger } from "@/lib/fifo"
import { AppShell } from "@/components/app-shell"
import { NoBook } from "@/components/no-book"
import { Button } from "@/components/ui/button"
import { TransactionsView, type ViewItem } from "@/components/transactions-view"

export const dynamic = "force-dynamic"

export default async function TransactionsPage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const allocated = allocate(debts, payments)
  const ledger = buildLedger(allocated, payments)
  const items: ViewItem[] = ledger.map((event) => ({
    event,
    receiptUrl:
      event.kind === "debt" && event.receipt
        ? assetUrl(event.receipt, 800)
        : undefined,
  }))

  return (
    <AppShell partnerName={book.partner_name}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Transaktioner</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/api/export?format=csv">
              <Download /> CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/rapport" target="_blank">
              <Download /> PDF
            </a>
          </Button>
        </div>
      </div>
      <TransactionsView items={items} partnerName={book.partner_name} />
    </AppShell>
  )
}
