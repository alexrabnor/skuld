'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addTransaction } from '@/app/actions'

export function TransactionDialog({ type }: { type: 'debt' | 'repayment' }) {
    const [open, setOpen] = useState(false)
    const isDebt = type === 'debt'

    async function actionWrapper(formData: FormData) {
        formData.append('type', type)
        if (!isDebt) {
            const amt = parseFloat(formData.get('amount') as string)
            if (amt > 0) {
                formData.set('amount', (-amt).toString()) // Ensure repayment is negative
            }
        }
        await addTransaction(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={isDebt ? 'default' : 'secondary'}
                    className={`flex-1 font-semibold ${isDebt ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                    {isDebt ? '+ Skuld' : '+ Återbetalning'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <form action={actionWrapper}>
                    <DialogHeader>
                        <DialogTitle className="text-xl">{isDebt ? 'Lägg till skuld' : 'Lägg till återbetalning'}</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Fyll i belopp och en kort beskrivning.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-zinc-300">Belopp (kr)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="Ex. 150"
                                required
                                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note" className="text-zinc-300">Anteckning</Label>
                            <Input
                                id="note"
                                name="note"
                                type="text"
                                placeholder="Ex. Pizza"
                                required
                                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-zinc-300">Datum (frivilligt)</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 block w-full text-zinc-300"
                            />
                            <p className="text-xs text-zinc-500">Lämnas tomt för dagens datum</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">Spara</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
