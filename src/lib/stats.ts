import type { DebtWithStatus, Payment, Category } from './types'
import { monthKey, monthLabel } from './format'
import { CATEGORIES } from './constants'

export interface Stats {
  totalLent: number // totalt utlagt (allt du lagt ut, oavsett återbetalt)
  totalRepaid: number // totalt återbetalat (i din favör)
  balance: number // nuvarande netto (+ = hon skyldig dig)
  txCount: number
  avgPerMonth: number
  biggest: DebtWithStatus | null
  topCategory: { category: Category; total: number } | null
}

export function computeStats(
  debts: DebtWithStatus[],
  payments: Payment[],
  balance: number,
): Stats {
  const lent = debts
    .filter((d) => d.direction === 'they_owe')
    .reduce((s, d) => s + d.amount, 0)
  const repaid = payments
    .filter((p) => p.direction === 'they_owe')
    .reduce((s, p) => s + Number(p.amount), 0)

  const months = new Set(debts.map((d) => monthKey(d.date)))
  const avgPerMonth = months.size ? lent / months.size : 0

  const biggest =
    debts.length === 0
      ? null
      : debts.reduce((m, d) => (d.amount > m.amount ? d : m), debts[0])

  const byCat = categoryBreakdown(debts)
  const topCategory = byCat.length
    ? byCat.reduce((m, c) => (c.total > m.total ? c : m), byCat[0])
    : null

  return {
    totalLent: lent,
    totalRepaid: repaid,
    balance,
    txCount: debts.length + payments.length,
    avgPerMonth,
    biggest,
    topCategory,
  }
}

export function categoryBreakdown(
  debts: DebtWithStatus[],
): { category: Category; total: number }[] {
  const map = new Map<Category, number>()
  for (const d of debts) {
    map.set(d.category, (map.get(d.category) ?? 0) + d.amount)
  }
  return CATEGORIES.map((category) => ({
    category,
    total: map.get(category) ?? 0,
  })).filter((c) => c.total > 0)
}

/** Saldo vecka för vecka (kumulativt netto efter varje händelse, grupperat per dag). */
export function balanceSeries(
  debts: DebtWithStatus[],
  payments: Payment[],
): { date: string; saldo: number }[] {
  const events: { date: string; delta: number }[] = [
    ...debts.map((d) => ({
      date: d.date,
      delta: d.direction === 'they_owe' ? d.amount : -d.amount,
    })),
    ...payments.map((p) => ({
      date: p.date,
      delta: p.direction === 'they_owe' ? -Number(p.amount) : Number(p.amount),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const out: { date: string; saldo: number }[] = []
  let running = 0
  for (const e of events) {
    running += e.delta
    const last = out[out.length - 1]
    if (last && last.date === e.date) last.saldo = running
    else out.push({ date: e.date, saldo: running })
  }
  return out
}

/** Utgifter (det du lagt ut) per månad. */
export function monthlySeries(
  debts: DebtWithStatus[],
): { key: string; month: string; belopp: number }[] {
  const map = new Map<string, number>()
  for (const d of debts) {
    if (d.direction !== 'they_owe') continue
    const k = monthKey(d.date)
    map.set(k, (map.get(k) ?? 0) + d.amount)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, belopp]) => ({
      key,
      month: monthLabel(key + '-01'),
      belopp,
    }))
}

/** Snabb sammanfattning för innevarande månad. */
export function thisMonthSummary(debts: DebtWithStatus[], payments: Payment[]) {
  const k = monthKey(new Date().toISOString())
  const lent = debts
    .filter((d) => monthKey(d.date) === k && d.direction === 'they_owe')
    .reduce((s, d) => s + d.amount, 0)
  const repaid = payments
    .filter((p) => monthKey(p.date) === k && p.direction === 'they_owe')
    .reduce((s, p) => s + Number(p.amount), 0)
  return { lent, repaid, net: lent - repaid }
}
