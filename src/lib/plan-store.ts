import { promises as fs } from 'fs'
import path from 'path'
import type { RepaymentPlan } from './plan-types'

/** Katalog där planfilen lagras (Docker-volym i produktion). */
const DATA_DIR = process.env.PLAN_DATA_DIR || path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'plans.json')

type Store = Record<string, RepaymentPlan>

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    return JSON.parse(raw) as Store
  } catch {
    return {}
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf8')
}

export async function getPlan(bookId: string): Promise<RepaymentPlan | null> {
  const store = await readStore()
  return store[bookId] ?? null
}

export async function savePlan(bookId: string, plan: RepaymentPlan): Promise<void> {
  const store = await readStore()
  store[bookId] = plan
  await writeStore(store)
}

export async function removePlan(bookId: string): Promise<void> {
  const store = await readStore()
  delete store[bookId]
  await writeStore(store)
}
