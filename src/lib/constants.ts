import type { Category, PaymentMethod } from './types'

export const CATEGORIES: Category[] = [
  'Lån/Pengar',
  'Mat',
  'Shopping',
  'Resor',
  'Restaurang',
  'Övrigt',
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Swish',
  'Kort',
  'Kontanter',
  'Banköverföring',
]

/** Ikon (lucide-namn) + Recharts-färg per kategori. */
export const CATEGORY_META: Record<Category, { icon: string; color: string }> = {
  'Lån/Pengar': { icon: 'Banknote', color: '#6366f1' },
  Mat: { icon: 'ShoppingCart', color: '#22c55e' },
  Shopping: { icon: 'ShoppingBag', color: '#ec4899' },
  Resor: { icon: 'Plane', color: '#06b6d4' },
  Restaurang: { icon: 'UtensilsCrossed', color: '#f59e0b' },
  Övrigt: { icon: 'CircleDashed', color: '#94a3b8' },
}

export const METHOD_ICON: Record<PaymentMethod, string> = {
  Swish: 'Smartphone',
  Kort: 'CreditCard',
  Kontanter: 'Coins',
  Banköverföring: 'Landmark',
}
