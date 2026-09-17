import type {
  Debt,
  Payment,
  DebtWithStatus,
  SettleStatus,
  LedgerEvent,
  Direction,
} from './types'

function statusOf(amount: number, repaid: number): SettleStatus {
  if (repaid <= 0.001) return 'unpaid'
  if (repaid >= amount - 0.001) return 'paid'
  return 'partial'
}

/**
 * FIFO-allokering: återbetalningar betalar av äldsta öppna skuld först,
 * inom matchande riktning. Returnerar skulder med beräknat `repaid`,
 * `remaining` och status. Ren funktion — muterar inget i Directus.
 */
export function allocate(debts: Debt[], payments: Payment[]): DebtWithStatus[] {
  // sortera stabilt: äldst datum först, därefter skapelseordning
  const byDate = (a: { date: string; date_created: string }, b: typeof a) =>
    a.date === b.date
      ? a.date_created.localeCompare(b.date_created)
      : a.date.localeCompare(b.date)

  const sortedDebts = [...debts].sort(byDate)
  const repaidMap = new Map<string, number>(sortedDebts.map((d) => [d.id, 0]))

  for (const dir of ['they_owe', 'i_owe'] as const) {
    const pool = payments
      .filter((p) => p.direction === dir)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    let left = pool
    for (const debt of sortedDebts) {
      if (debt.direction !== dir) continue
      if (left <= 0) break
      const owed = Number(debt.amount)
      const take = Math.min(owed, left)
      repaidMap.set(debt.id, take)
      left -= take
    }
  }

  return sortedDebts.map((d) => {
    const repaid = repaidMap.get(d.id) ?? 0
    const amount = Number(d.amount)
    return {
      ...d,
      amount,
      repaid,
      remaining: Math.max(0, amount - repaid),
      status: statusOf(amount, repaid),
    }
  })
}

/**
 * Nettosaldo: positivt = motparten är skyldig dig, negativt = du är skyldig.
 *
 * Räknas på råa summor, inte på `remaining`, eftersom `remaining` är nollklampad
 * per post: en återbetalning som är större än de öppna skulderna i sin riktning
 * lämnar ett överskott som inte hör till någon enskild skuld, men som ska vända
 * saldot åt andra hållet.
 */
export function balanceOf(debts: Debt[], payments: Payment[]): number {
  const sum = (
    rows: { direction: Direction; amount: number }[],
    dir: Direction,
  ) =>
    rows
      .filter((r) => r.direction === dir)
      .reduce((acc, r) => acc + Number(r.amount), 0)

  const theyOwe = sum(debts, 'they_owe') - sum(payments, 'they_owe')
  const iOwe = sum(debts, 'i_owe') - sum(payments, 'i_owe')
  return theyOwe - iOwe
}

/** Sammanslagen, datumsorterad lista av skulder + återbetalningar (nyast först). */
export function buildLedger(
  debts: DebtWithStatus[],
  payments: Payment[],
): LedgerEvent[] {
  const events: LedgerEvent[] = [
    ...debts.map((d) => ({ kind: 'debt' as const, ...d })),
    ...payments.map((p) => ({ kind: 'payment' as const, ...p, amount: Number(p.amount) })),
  ]
  return events.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.date_created.localeCompare(a.date_created)
  })
}
