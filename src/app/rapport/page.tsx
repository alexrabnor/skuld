import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, balanceOf, buildLedger } from "@/lib/fifo"
import { computeStats } from "@/lib/stats"
import { kr, longDate, STATUS_LABEL } from "@/lib/format"
import { NoBook } from "@/components/no-book"
import { PrintButton } from "@/components/print-button"

export const dynamic = "force-dynamic"

export default async function ReportPage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const allocated = allocate(debts, payments)
  const balance = balanceOf(allocated)
  const ledger = buildLedger(allocated, payments)
  const stats = computeStats(allocated, payments, balance)
  const today = longDate(new Date().toISOString().slice(0, 10))

  const balanceText =
    Math.abs(balance) < 0.5
      ? "Allt reglerat"
      : balance > 0
        ? `${book.partner_name} är skyldig mig ${kr(Math.abs(balance))}`
        : `Jag är skyldig ${book.partner_name} ${kr(Math.abs(balance))}`

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-black sm:p-10 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <a href="/transaktioner" className="text-sm text-zinc-500 hover:underline">
          ← Tillbaka
        </a>
        <PrintButton auto />
      </div>

      <header className="mb-6 border-b border-zinc-300 pb-4">
        <h1 className="text-2xl font-bold">Skuldrapport – {book.partner_name}</h1>
        <p className="text-sm text-zinc-500">Genererad {today}</p>
      </header>

      <section className="mb-6">
        <div className="rounded-lg bg-zinc-100 p-4">
          <p className="text-sm text-zinc-500">Aktuellt saldo</p>
          <p className="text-xl font-bold">{balanceText}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Sammanfattning
        </h2>
        <table className="w-full text-sm">
          <tbody>
            <SumRow label="Totalt utlånat" value={kr(stats.totalLent)} />
            <SumRow label="Totalt återbetalat" value={kr(stats.totalRepaid)} />
            <SumRow label="Nuvarande skuld" value={kr(stats.balance)} />
            <SumRow label="Antal transaktioner" value={String(stats.txCount)} />
            <SumRow label="Snitt per månad" value={kr(stats.avgPerMonth)} />
            <SumRow
              label="Största utlägg"
              value={stats.biggest ? kr(stats.biggest.amount) : "–"}
            />
            <SumRow
              label="Mest använda kategori"
              value={stats.topCategory?.category ?? "–"}
            />
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Transaktioner
        </h2>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-400 text-left">
              <th className="py-1.5 pr-2">Datum</th>
              <th className="py-1.5 pr-2">Typ</th>
              <th className="py-1.5 pr-2">Kategori</th>
              <th className="py-1.5 pr-2">Beskrivning</th>
              <th className="py-1.5 pr-2 text-right">Belopp</th>
              <th className="py-1.5 pr-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((e) => (
              <tr key={`${e.kind}-${e.id}`} className="border-b border-zinc-200">
                <td className="py-1.5 pr-2 whitespace-nowrap">{longDate(e.date)}</td>
                <td className="py-1.5 pr-2">
                  {e.kind === "debt" ? "Skuld" : "Återbetalning"}
                </td>
                <td className="py-1.5 pr-2">{e.kind === "debt" ? e.category : "–"}</td>
                <td className="py-1.5 pr-2">
                  {e.kind === "debt" ? e.description : e.comment || "Återbetalning"}
                </td>
                <td className="py-1.5 pr-2 text-right tabular-nums">
                  {e.kind === "debt" ? "+" : "−"}
                  {kr(e.amount)}
                </td>
                <td className="py-1.5 pr-2">
                  {e.kind === "debt" ? STATUS_LABEL[e.status] : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-zinc-200">
      <td className="py-1.5 text-zinc-600">{label}</td>
      <td className="py-1.5 text-right font-medium tabular-nums">{value}</td>
    </tr>
  )
}
