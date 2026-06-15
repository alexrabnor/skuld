import type { Book, Debt, Payment } from './types'

export const DIRECTUS_URL =
  process.env.DIRECTUS_INTERNAL_URL || 'http://databas-directus:8055'

/** Publik bas-URL för att visa kvittobilder i webbläsaren. */
export const DIRECTUS_PUBLIC_URL =
  process.env.DIRECTUS_PUBLIC_URL || 'https://databasen.alexcloud.se'

/**
 * Statisk token för app-kontot. Appen har ingen inloggning – alla anrop mot
 * Directus görs serverside med denna token (sätts i .env, läcker aldrig till klienten).
 */
export async function getToken(): Promise<string | null> {
  return process.env.DIRECTUS_TOKEN || null
}

export async function directusFetch(
  path: string,
  options?: RequestInit,
  token?: string | null,
): Promise<Response> {
  const t = token ?? (await getToken())
  return fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options?.headers,
    },
  })
}

/**
 * Returnerar app-kontots statiska token. Ingen inloggning krävs – token finns i
 * miljövariabeln DIRECTUS_TOKEN. Saknas den är det ett konfigurationsfel.
 */
export async function requireAuth(): Promise<{ token: string }> {
  const token = await getToken()
  if (!token) throw new Error('DIRECTUS_TOKEN saknas i miljön')
  return { token }
}

/** Hämtar (eller upptäcker att det saknas) den inloggade användarens första bok. */
export async function getBook(token: string): Promise<Book | null> {
  const res = await directusFetch(
    '/items/skuld_books?fields=id,partner_name&sort=date_created&limit=1',
    undefined,
    token,
  )
  if (!res.ok) return null
  const { data } = await res.json()
  return data?.[0] || null
}

const DEBT_FIELDS =
  'id,book,date,amount,direction,payer,category,payment_method,description,note,receipt,date_created'
const PAYMENT_FIELDS = 'id,book,date,amount,direction,method,comment,date_created'

export async function getDebts(bookId: string, token: string): Promise<Debt[]> {
  const res = await directusFetch(
    `/items/skuld_debts?filter[book][_eq]=${bookId}&fields=${DEBT_FIELDS}&limit=-1`,
    undefined,
    token,
  )
  if (!res.ok) return []
  const { data } = await res.json()
  return (data || []).map((d: Debt) => ({ ...d, amount: Number(d.amount) }))
}

export async function getPayments(bookId: string, token: string): Promise<Payment[]> {
  const res = await directusFetch(
    `/items/skuld_payments?filter[book][_eq]=${bookId}&fields=${PAYMENT_FIELDS}&limit=-1`,
    undefined,
    token,
  )
  if (!res.ok) return []
  const { data } = await res.json()
  return (data || []).map((p: Payment) => ({ ...p, amount: Number(p.amount) }))
}

/** Laddar allt som dashboarden/vyerna behöver i ett svep. */
export async function loadBookData(token: string) {
  const book = await getBook(token)
  if (!book) return { book: null, debts: [], payments: [] }
  const [debts, payments] = await Promise.all([
    getDebts(book.id, token),
    getPayments(book.id, token),
  ])
  return { book, debts, payments }
}

export function assetUrl(fileId: string, width?: number): string {
  const q = width ? `?width=${width}&quality=80&fit=cover` : ''
  return `${DIRECTUS_PUBLIC_URL}/assets/${fileId}${q}`
}
