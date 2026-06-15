/** Typer + rena hjälpfunktioner för återbetalningsplanen. Inga node-beroenden –
 *  säker att importera från klientkomponenter (type-only). */

export interface Installment {
  id: string
  /** Förfallodatum, ISO "YYYY-MM-DD". */
  date: string
  amount: number
}

export interface PlanSignature {
  /** Namnet personen skrev under med. */
  name: string
  /** Signaturen som PNG data-URL. */
  image: string
  /** När den skrevs under, ISO. */
  signedAt: string
}

export interface RepaymentPlan {
  installments: Installment[]
  /** Villkor / fritext som båda kommer överens om. */
  note: string
  /** Saldot (kr) planen upprättades mot – det Klara var skyldig då. */
  startBalance: number
  createdAt: string
  updatedAt: string
  signature: PlanSignature | null
}

export function planTotal(installments: Installment[]): number {
  return installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
}
