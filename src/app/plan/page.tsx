import { CheckCircle2, FileSignature, PenLine } from "lucide-react"

import { requireAuth, loadBookData } from "@/lib/directus"
import { allocate, balanceOf } from "@/lib/fifo"
import { getPlan } from "@/lib/plan-store"
import { planTotal } from "@/lib/plan-types"
import { kr, longDate } from "@/lib/format"
import { AppShell } from "@/components/app-shell"
import { NoBook } from "@/components/no-book"
import { PlanBuilder } from "@/components/plan-builder"
import { SignaturePad } from "@/components/signature-pad"
import { PlanLockedActions } from "@/components/plan-locked-actions"

export const dynamic = "force-dynamic"

export default async function PlanPage() {
  const { token } = await requireAuth()
  const { book, debts, payments } = await loadBookData(token)
  if (!book) return <NoBook />

  const balance = balanceOf(allocate(debts, payments))
  const outstanding = Math.abs(balance)
  const theyOwe = balance >= 0
  const partner = book.partner_name
  const plan = await getPlan(book.id)
  const signed = plan?.signature

  const payerLabel = theyOwe
    ? `${partner} betalar tillbaka`
    : `Jag betalar tillbaka till ${partner}`

  return (
    <AppShell partnerName={partner}>
      <div className="space-y-6">
        {/* Rubrik */}
        <div>
          <div className="kicker flex items-center gap-2 text-brand">
            <FileSignature className="size-3.5" /> Återbetalningsplan
          </div>
          <h1 className="font-display mt-1 text-4xl">Överenskommelse</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {outstanding < 0.5
              ? "Det finns inget utestående saldo just nu."
              : `${payerLabel} ${kr(outstanding)}. Lägg upp en plan ni är överens om och låt ${partner} skriva under.`}
          </p>
        </div>

        {/* Inget att planera och ingen plan → tomt läge */}
        {outstanding < 0.5 && !plan ? (
          <div className="rounded-sm border border-dashed p-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" />
            <p className="mt-3 text-sm text-muted-foreground">
              När det finns en skuld kan du lägga upp en återbetalningsplan här.
            </p>
          </div>
        ) : signed ? (
          /* ---------- Signerat avtal (låst) ---------- */
          <div className="space-y-6">
            <div className="overflow-hidden rounded-sm border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b bg-emerald-600/10 px-5 py-3">
                <span className="kicker flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Signerad
                </span>
                <span className="text-xs text-muted-foreground">
                  Upprättad {longDate(plan.createdAt.slice(0, 10))}
                </span>
              </div>

              <div className="space-y-5 p-5">
                <ol className="divide-y">
                  {plan.installments.map((inst, i) => (
                    <li
                      key={inst.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display w-6 text-center text-lg text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-sm">{longDate(inst.date)}</span>
                      </div>
                      <span className="font-display text-lg tabular-nums">
                        {kr(inst.amount)}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="kicker text-muted-foreground">Totalt</span>
                  <span className="font-display text-2xl tabular-nums">
                    {kr(planTotal(plan.installments))}
                  </span>
                </div>

                {plan.note && (
                  <div className="rounded-sm bg-muted/40 p-4">
                    <div className="kicker mb-2 text-muted-foreground">Villkor</div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {plan.note}
                    </p>
                  </div>
                )}

                {/* Underskrift */}
                <div className="border-t pt-5">
                  <div className="kicker mb-3 text-muted-foreground">Underskrift</div>
                  <div className="rounded-sm border bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signed.image}
                      alt={`Signatur ${signed.name}`}
                      className="mx-auto h-28 w-auto"
                    />
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">{signed.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      skrev under den {longDate(signed.signedAt.slice(0, 10))}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <PlanLockedActions />
          </div>
        ) : (
          /* ---------- Bygg / redigera + signera ---------- */
          <div className="space-y-8">
            <section className="rounded-sm border bg-card p-5 shadow-sm">
              <PlanBuilder
                outstanding={outstanding}
                partnerName={partner}
                initialPlan={plan}
              />
            </section>

            {plan && (
              <section className="rounded-sm border bg-card p-5 shadow-sm">
                <div className="kicker mb-1 flex items-center gap-2 text-brand">
                  <PenLine className="size-3.5" /> Underskrift
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {partner}, granska planen ovan och skriv under för att godkänna den.
                </p>
                <SignaturePad partnerName={partner} />
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
