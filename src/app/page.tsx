import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionDialog } from '@/components/transaction-dialog'
import Link from 'next/link'
import { logout } from './login/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null // Handled by middleware mostly

  // Get Household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id, households(name)')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Inget hushåll hittades</CardTitle>
            <CardDescription>Du är inte tillagd i något hushåll ännu. Be administratören att lägga till dig via databasen.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">Logga ut</Button>
            </form>
          </div>
        </Card>
      </div>
    )
  }

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('household_id', member.household_id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch all transactions for total calculation
  // (In a giant DB we would do an RPC, but for V1 we just fetch all or aggregate)
  const { data: allTx } = await supabase
    .from('transactions')
    .select('amount')
    .eq('household_id', member.household_id)

  const total = allTx?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  const isOwed = total > 0
  const absTotal = Math.abs(total)

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {(member.households as any)?.name || 'Skuld'}
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Historik
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Logga ut
            </button>
          </form>
        </div>
      </header>

      <main className="space-y-6">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
          <CardHeader className="text-center space-y-2 pb-8 pt-10">
            <CardDescription className="text-lg text-zinc-400">Total balans</CardDescription>
            <CardTitle className={`text-6xl md:text-7xl font-black tracking-tighter ${isOwed ? 'text-emerald-400' : total < 0 ? 'text-red-400' : 'text-zinc-100'}`}>
              {total === 0 ? '0' : absTotal} <span className="text-3xl text-zinc-500 font-medium">kr</span>
            </CardTitle>
            <p className="pt-2 text-zinc-300 font-medium">
              {total === 0
                ? "Ni är kvitt! 🎉"
                : isOwed
                  ? `Hon är skyldig dig ${absTotal} kr`
                  : `Du är skyldig henne ${absTotal} kr`}
            </p>
          </CardHeader>
        </Card>

        <div className="flex gap-4">
          <TransactionDialog type="debt" />
          <TransactionDialog type="repayment" />
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold text-zinc-200">Senaste händelser</h2>
          {transactions && transactions.length > 0 ? (
            <div className="grid gap-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-100">{tx.note}</span>
                    <span className="text-sm text-zinc-500">{tx.date}</span>
                  </div>
                  <span className={`font-semibold ${tx.amount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} kr
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-8">Inga transaktioner ännu.</p>
          )}
        </div>
      </main>
    </div>
  )
}
