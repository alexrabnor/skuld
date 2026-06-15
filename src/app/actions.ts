'use server'

import { revalidatePath } from 'next/cache'
import {
  DIRECTUS_URL,
  directusFetch,
  getBook,
  requireAuth,
} from '@/lib/directus'
import type { Direction, Payer } from '@/lib/types'

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/transaktioner')
  revalidatePath('/statistik')
  revalidatePath('/tidslinje')
  revalidatePath('/rapport')
}

async function ctx() {
  const { token } = await requireAuth()
  const book = await getBook(token)
  if (!book) throw new Error('Ingen skuldbok hittades')
  return { token, book }
}

/** Laddar upp en kvittobild till Directus och returnerar fil-id. */
async function uploadReceipt(file: File, token: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) return null
  const { data } = await res.json()
  return data?.id ?? null
}

export async function addDebt(formData: FormData) {
  const { token, book } = await ctx()

  const payer = (formData.get('payer') as Payer) || 'me'
  // riktning härleds: jag betalade → hon skyldig mig; hon betalade → jag skyldig
  const direction: Direction = payer === 'me' ? 'they_owe' : 'i_owe'

  const receiptFile = formData.get('receipt') as File | null
  const receipt = receiptFile ? await uploadReceipt(receiptFile, token) : null

  const body = {
    book: book.id,
    date: (formData.get('date') as string) || new Date().toISOString().slice(0, 10),
    amount: parseFloat(formData.get('amount') as string),
    payer,
    direction,
    category: (formData.get('category') as string) || 'Övrigt',
    payment_method: (formData.get('payment_method') as string) || 'Swish',
    description: (formData.get('description') as string) || '',
    note: (formData.get('note') as string) || null,
    receipt,
  }

  const res = await directusFetch('/items/skuld_debts', {
    method: 'POST',
    body: JSON.stringify(body),
  }, token)
  if (!res.ok) throw new Error('Kunde inte spara skulden: ' + (await res.text()))
  revalidateAll()
}

export async function addPayment(formData: FormData) {
  const { token, book } = await ctx()

  const body = {
    book: book.id,
    date: (formData.get('date') as string) || new Date().toISOString().slice(0, 10),
    amount: parseFloat(formData.get('amount') as string),
    direction: (formData.get('direction') as Direction) || 'they_owe',
    method: (formData.get('method') as string) || 'Swish',
    comment: (formData.get('comment') as string) || null,
  }

  const res = await directusFetch('/items/skuld_payments', {
    method: 'POST',
    body: JSON.stringify(body),
  }, token)
  if (!res.ok) throw new Error('Kunde inte spara återbetalningen: ' + (await res.text()))
  revalidateAll()
}

/** Snabb "markera reglerad": registrerar en återbetalning på angivet belopp. */
export async function settleAmount(direction: Direction, amount: number) {
  const { token, book } = await ctx()
  if (amount <= 0) return
  const res = await directusFetch('/items/skuld_payments', {
    method: 'POST',
    body: JSON.stringify({
      book: book.id,
      date: new Date().toISOString().slice(0, 10),
      amount,
      direction,
      method: 'Swish',
      comment: 'Markerad som reglerad',
    }),
  }, token)
  if (!res.ok) throw new Error('Kunde inte registrera')
  revalidateAll()
}

export async function deleteDebt(id: string) {
  const { token } = await requireAuth()
  await directusFetch(`/items/skuld_debts/${id}`, { method: 'DELETE' }, token)
  revalidateAll()
}

export async function deletePayment(id: string) {
  const { token } = await requireAuth()
  await directusFetch(`/items/skuld_payments/${id}`, { method: 'DELETE' }, token)
  revalidateAll()
}
