import { format, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'

/** "4 250 kr" */
export function kr(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** Bara siffran med tusentalsavgränsare, utan "kr". */
export function num(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** "12 juni 2026" */
export function longDate(iso: string): string {
  return format(parseISO(iso), 'd MMMM yyyy', { locale: sv })
}

/** "12 jun" */
export function shortDate(iso: string): string {
  return format(parseISO(iso), 'd MMM', { locale: sv })
}

/** "juni 2026" */
export function monthLabel(iso: string): string {
  return format(parseISO(iso), 'MMMM yyyy', { locale: sv })
}

/** "2026-06" månadsnyckel för gruppering. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export const STATUS_LABEL = {
  unpaid: 'Ej återbetald',
  partial: 'Delvis återbetald',
  paid: 'Helt återbetald',
} as const
