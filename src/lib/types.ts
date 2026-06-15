export type Direction = 'they_owe' | 'i_owe'
export type Payer = 'me' | 'partner'
export type PaymentMethod = 'Swish' | 'Kort' | 'Kontanter' | 'Banköverföring'
export type Category =
  | 'Lån/Pengar'
  | 'Mat'
  | 'Shopping'
  | 'Resor'
  | 'Restaurang'
  | 'Övrigt'

export type SettleStatus = 'unpaid' | 'partial' | 'paid'

export interface Book {
  id: string
  partner_name: string
}

export interface Debt {
  id: string
  book: string
  date: string
  amount: number
  repaid: number
  direction: Direction
  payer: Payer
  category: Category
  payment_method: PaymentMethod
  description: string
  note: string | null
  receipt: string | null
  date_created: string
}

export interface Payment {
  id: string
  book: string
  date: string
  amount: number
  direction: Direction
  method: PaymentMethod
  comment: string | null
  date_created: string
}

export interface DebtWithStatus extends Debt {
  remaining: number
  status: SettleStatus
}

/** En händelse i tidslinjen/listan — antingen en skuld eller en återbetalning. */
export type LedgerEvent =
  | ({ kind: 'debt' } & DebtWithStatus)
  | ({ kind: 'payment' } & Payment)
