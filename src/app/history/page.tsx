import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.query?.toLowerCase() || ''
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get Household
    const { data: member } = await supabase
        .from('household_members')
        .select('household_id, households(name)')
        .eq('user_id', user.id)
        .single()

    if (!member) return null

    // Fetch all transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('household_id', member.household_id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    const filtered = transactions?.filter(tx => {
        if (!query) return true
        return tx.note.toLowerCase().includes(query)
    }) || []

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header className="flex justify-between items-center pb-4">
                <h1 className="text-2xl font-bold tracking-tight">Historik</h1>
                <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    &larr; Tillbaka
                </Link>
            </header>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle>Alla transaktioner</CardTitle>
                    <CardDescription>Sök och filtrera bland era gemensamma utgifter.</CardDescription>

                    <form className="pt-4 flex gap-2" method="GET">
                        <Input
                            name="query"
                            placeholder="Sök på anteckning..."
                            defaultValue={query}
                            className="max-w-xs bg-zinc-950/50 border-zinc-700"
                        />
                    </form>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-zinc-800 bg-zinc-950/30">
                        <Table>
                            <TableHeader className="bg-zinc-900/50">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Datum</TableHead>
                                    <TableHead className="text-zinc-400">Anteckning</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Belopp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(tx => (
                                    <TableRow key={tx.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                                        <TableCell className="font-medium text-zinc-300">{tx.date}</TableCell>
                                        <TableCell className="text-zinc-100">{tx.note}</TableCell>
                                        <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount} kr
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-zinc-500">
                                            Inga resultat hittades.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
