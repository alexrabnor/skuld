import { NextResponse } from "next/server"
import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, buildLedger } from "@/lib/fifo"
import { STATUS_LABEL } from "@/lib/format"

function csvCell(v: string | number): string {
  const s = String(v ?? "")
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return new NextResponse("Ingen bok", { status: 404 })

  const allocated = allocate(debts, payments)
  const ledger = buildLedger(allocated, payments)

  const header = [
    "Datum",
    "Typ",
    "Kategori",
    "Beskrivning",
    "Riktning",
    "Belopp",
    "Återbetalat",
    "Kvar",
    "Betalsätt",
    "Status",
    "Kommentar",
  ]

  const rows = ledger.map((e) => {
    if (e.kind === "debt") {
      return [
        e.date,
        "Skuld",
        e.category,
        e.description,
        e.direction === "they_owe" ? "Skyldig mig" : "Jag skyldig",
        e.amount,
        e.repaid,
        e.remaining,
        e.payment_method,
        STATUS_LABEL[e.status],
        e.note ?? "",
      ]
    }
    return [
      e.date,
      "Återbetalning",
      "",
      "",
      e.direction === "they_owe" ? "Till mig" : "Från mig",
      e.amount,
      "",
      "",
      e.method,
      "",
      e.comment ?? "",
    ]
  })

  const csv = [header, ...rows]
    .map((r) => r.map(csvCell).join(";"))
    .join("\r\n")

  // BOM så att Excel tolkar UTF-8 (å/ä/ö) korrekt
  const body = "﻿" + csv
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skuld-${book.partner_name}-${date}.csv"`,
    },
  })
}
