'use server'

import { revalidatePath } from 'next/cache'
import { getBook, loadBookData, requireAuth } from '@/lib/directus'
import { allocate, balanceOf } from '@/lib/fifo'
import { getPlan, removePlan, savePlan as persist } from '@/lib/plan-store'
import type { Installment, RepaymentPlan } from '@/lib/plan-types'

async function bookId(): Promise<string> {
  const { token } = await requireAuth()
  const book = await getBook(token)
  if (!book) throw new Error('Ingen skuldbok hittades')
  return book.id
}

/** Aktuellt utestående saldo (absolutbelopp) som planen ska täcka. */
async function outstanding(): Promise<number> {
  const { token } = await requireAuth()
  const { debts, payments } = await loadBookData(token)
  return Math.abs(balanceOf(allocate(debts, payments)))
}

function parseInstallments(raw: string): Installment[] {
  let arr: unknown
  try {
    arr = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(arr)) return []
  return arr
    .map((r) => r as Partial<Installment>)
    .filter((r) => r && r.date && Number(r.amount) > 0)
    .map((r) => ({
      id: String(r.id || crypto.randomUUID()),
      date: String(r.date),
      amount: Math.round(Number(r.amount) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Skapar eller uppdaterar planen. All redigering nollställer ev. signatur –
 *  ändras avtalet måste det skrivas under på nytt. */
export async function savePlan(formData: FormData) {
  const id = await bookId()
  const installments = parseInstallments(String(formData.get('installments') || '[]'))
  if (installments.length === 0) throw new Error('Planen måste ha minst en delbetalning')
  const note = String(formData.get('note') || '').trim()

  const existing = await getPlan(id)
  const now = new Date().toISOString()
  const plan: RepaymentPlan = {
    installments,
    note,
    startBalance: existing?.startBalance ?? (await outstanding()),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    signature: null,
  }
  await persist(id, plan)
  revalidatePath('/plan')
  revalidatePath('/')
}

/** Klara skriver under den överenskomna planen. */
export async function signPlan(name: string, image: string) {
  const id = await bookId()
  const plan = await getPlan(id)
  if (!plan) throw new Error('Det finns ingen plan att skriva under')
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Ange ditt namn')
  if (!image.startsWith('data:image/png;base64,') || image.length > 400_000) {
    throw new Error('Ogiltig signatur')
  }
  plan.signature = { name: trimmed, image, signedAt: new Date().toISOString() }
  await persist(id, plan)
  revalidatePath('/plan')
  revalidatePath('/')
}

/** Öppnar planen för revidering igen (tar bort signaturen). */
export async function clearSignature() {
  const id = await bookId()
  const plan = await getPlan(id)
  if (!plan) return
  plan.signature = null
  plan.updatedAt = new Date().toISOString()
  await persist(id, plan)
  revalidatePath('/plan')
  revalidatePath('/')
}

export async function deletePlan() {
  const id = await bookId()
  await removePlan(id)
  revalidatePath('/plan')
  revalidatePath('/')
}
