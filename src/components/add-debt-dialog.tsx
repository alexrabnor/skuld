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
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import { addDebt } from "@/app/actions"

const today = () => new Date().toISOString().slice(0, 10)

export function AddDebtDialog({
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
      await addDebt(formData)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny skuld</DialogTitle>
          <DialogDescription>Lägg till ett utlägg eller utlånade pengar.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d-amount">Belopp (kr)</Label>
              <Input
                id="d-amount"
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
              <Label htmlFor="d-date">Datum</Label>
              <Input id="d-date" name="date" type="date" defaultValue={today()} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-payer">Vem betalade?</Label>
            <Select id="d-payer" name="payer" defaultValue="me">
              <option value="me">Jag (= {partnerName} blir skyldig mig)</option>
              <option value="partner">{partnerName} (= jag blir skyldig {partnerName})</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d-category">Kategori</Label>
              <Select id="d-category" name="category" defaultValue="Mat">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-method">Betalsätt</Label>
              <Select id="d-method" name="payment_method" defaultValue="Swish">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-desc">Beskrivning</Label>
            <Input id="d-desc" name="description" placeholder="t.ex. ICA, biobiljetter…" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-note">Anteckningar</Label>
            <Textarea id="d-note" name="note" placeholder="Valfritt" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-receipt">Kvitto (valfritt)</Label>
            <Input id="d-receipt" name="receipt" type="file" accept="image/*" />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Spara skuld
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
