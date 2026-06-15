import { TransactionItem } from "@/components/transaction-item"
import { assetUrl } from "@/lib/directus"
import type { LedgerEvent } from "@/lib/types"

export function TransactionList({
  events,
  partnerName,
  empty = "Inga transaktioner ännu.",
}: {
  events: LedgerEvent[]
  partnerName: string
  empty?: string
}) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">{empty}</div>
    )
  }
  return (
    <div className="divide-y divide-border/60">
      {events.map((e) => (
        <TransactionItem
          key={`${e.kind}-${e.id}`}
          event={e}
          partnerName={partnerName}
          receiptUrl={
            e.kind === "debt" && e.receipt ? assetUrl(e.receipt, 800) : undefined
          }
        />
      ))}
    </div>
  )
}
