"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PAYMENT_METHODS } from "@/lib/constants"
import { addPayment } from "@/app/actions"

const today = () => new Date().toISOString().slice(0, 10)

export function AddPaymentDialog({
  partnerName,
  children,
}: {
  partnerName: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await addPayment(formData)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrera återbetalning</DialogTitle>
          <DialogDescription>
            Återbetalningen dras automatiskt av mot äldsta öppna skuld (FIFO).
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-amount">Belopp (kr)</Label>
              <Input
                id="p-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-date">Datum</Label>
              <Input id="p-date" name="date" type="date" defaultValue={today()} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-direction">Vad gäller det?</Label>
            <Select id="p-direction" name="direction" defaultValue="they_owe">
              <option value="they_owe">{partnerName} betalar tillbaka till mig</option>
              <option value="i_owe">Jag betalar tillbaka till {partnerName}</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-method">Betalsätt</Label>
            <Select id="p-method" name="method" defaultValue="Swish">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-comment">Kommentar</Label>
            <Textarea id="p-comment" name="comment" placeholder="Valfritt" />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Spara återbetalning
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
