import type { Debt, Payment, DebtWithStatus, SettleStatus, LedgerEvent, Direction } from './types'

function statusOf(amount: number, repaid: number): SettleStatus {
  if (repaid <= 0.001) return 'unpaid'
  if (repaid >= amount - 0.001) return 'paid'
  return 'partial'
}

const OPPOSITE: Record<Direction, Direction> = {
  they_owe: 'i_owe',
  i_owe: 'they_owe',
}

function sumOf(rows: { direction: Direction; amount: number | string }[], dir: Direction): number {
  return rows
    .filter((r) => r.direction === dir)
    .reduce((sum, r) => sum + Number(r.amount), 0)
}

/**
 * FIFO-allokering: återbetalningar betalar av äldsta öppna skuld först,
 * inom matchande riktning. Blir det pengar över (någon har betalat mer än
 * sina skulder) går överskottet vidare och betalar av skulderna åt andra
 * hållet. Returnerar skulder med beräknat `repaid`, `remaining` och status.
 * Ren funktion — muterar inget i Directus.
 */
export function allocate(debts: Debt[], payments: Payment[]): DebtWithStatus[] {
  // sortera stabilt: äldst datum först, därefter skapelseordning
  const byDate = (a: { date: string; date_created: string }, b: typeof a) =>
    a.date === b.date
      ? a.date_created.localeCompare(b.date_created)
      : a.date.localeCompare(b.date)

  const sortedDebts = [...debts].sort(byDate)
  const repaidMap = new Map<string, number>(sortedDebts.map((d) => [d.id, 0]))

  /** Betalar av skulder i en riktning, äldst först. Returnerar det som blev över. */
  const payOff = (pool: number, dir: Direction): number => {
    let left = pool
    for (const debt of sortedDebts) {
      if (debt.direction !== dir) continue
      if (left <= 0) break
      const open = Number(debt.amount) - (repaidMap.get(debt.id) ?? 0)
      if (open <= 0) continue
      const take = Math.min(open, left)
      repaidMap.set(debt.id, (repaidMap.get(debt.id) ?? 0) + take)
      left -= take
    }
    return left
  }

  // 1) varje riktnings återbetalningar mot sina egna skulder
  const over: Record<Direction, number> = { they_owe: 0, i_owe: 0 }
  for (const dir of ['they_owe', 'i_owe'] as const) {
    over[dir] = payOff(sumOf(payments, dir), dir)
  }

  // 2) överskottet täcker skulderna åt andra hållet — betalar hon tillbaka mer
  //    än hon lånat har hon börjat betala av det du är skyldig henne
  for (const dir of ['they_owe', 'i_owe'] as const) {
    if (over[dir] > 0) over[dir] = payOff(over[dir], OPPOSITE[dir])
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
 * Räknas på råa belopp, inte på allokeringen, så att en överbetalning slår
 * igenom hela vägen ner i minus i stället för att stanna på noll.
 */
export function balanceOf(debts: Debt[], payments: Payment[]): number {
  const theyOwe = sumOf(debts, 'they_owe') - sumOf(payments, 'they_owe')
  const iOwe = sumOf(debts, 'i_owe') - sumOf(payments, 'i_owe')
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
