"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowDownLeft, Trash2, Loader2, CheckCircle2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import { cn } from "@/lib/utils"
import { kr, longDate, STATUS_LABEL } from "@/lib/format"
import type { LedgerEvent } from "@/lib/types"
import { deleteDebt, deletePayment, settleAmount } from "@/app/actions"

const STATUS_VARIANT = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
} as const

export function TransactionItem({
  event,
  partnerName,
  receiptUrl,
}: {
  event: LedgerEvent
  partnerName: string
  receiptUrl?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  const isDebt = event.kind === "debt"

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn()
      setOpen(false)
      router.refresh()
    })
  }

  // visningsvärden
  const amountText = isDebt
    ? `+${kr(event.amount)}`
    : `−${kr(event.amount)}`
  const amountTone = !isDebt
    ? "text-emerald-600 dark:text-emerald-400"
    : event.direction === "they_owe"
      ? "text-red-600 dark:text-red-400"
      : "text-blue-600 dark:text-blue-400"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
      >
        {isDebt ? (
          <CategoryIcon category={event.category} />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <ArrowDownLeft className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {isDebt ? event.description || event.category : "Återbetalning"}
            </p>
            {isDebt && (
              <Badge variant={STATUS_VARIANT[event.status]} className="hidden sm:inline-flex">
                {STATUS_LABEL[event.status]}
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {longDate(event.date)} · {isDebt ? event.category : event.method}
          </p>
        </div>

        <div className={cn("shrink-0 text-sm font-semibold tabular-nums", amountTone)}>
          {amountText}
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isDebt ? event.description || event.category : "Återbetalning"}
            </DialogTitle>
            <DialogDescription>{longDate(event.date)}</DialogDescription>
          </DialogHeader>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="Belopp" value={kr(event.amount)} />
            {isDebt ? (
              <>
                <Field label="Kategori" value={event.category} />
                <Field
                  label="Riktning"
                  value={
                    event.direction === "they_owe"
                      ? `${partnerName} skyldig mig`
                      : `Jag skyldig ${partnerName}`
                  }
                />
                <Field label="Betalsätt" value={event.payment_method} />
                <Field label="Återbetalat" value={kr(event.repaid)} />
                <Field label="Kvar" value={kr(event.remaining)} />
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={STATUS_VARIANT[event.status]}>
                      {STATUS_LABEL[event.status]}
                    </Badge>
                  </dd>
                </div>
                {event.note && <Field label="Anteckning" value={event.note} full />}
                {receiptUrl && (
                  <div className="col-span-2">
                    <dt className="mb-1 text-xs text-muted-foreground">Kvitto</dt>
                    <a href={receiptUrl} target="_blank" rel="noreferrer">
                      <Image
                        src={receiptUrl}
                        alt="Kvitto"
                        width={400}
                        height={300}
                        unoptimized
                        className="max-h-64 w-auto rounded-lg border object-contain"
                      />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <>
                <Field label="Betalsätt" value={event.method} />
                {event.comment && <Field label="Kommentar" value={event.comment} full />}
              </>
            )}
          </dl>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
            {isDebt && event.remaining > 0.5 && (
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  run(() => settleAmount(event.direction, event.remaining))
                }
              >
                {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                Markera reglerad ({kr(event.remaining)})
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              onClick={() =>
                run(() =>
                  isDebt ? deleteDebt(event.id) : deletePayment(event.id)
                )
              }
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Ta bort
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Field({
  label,
  value,
  full,
}: {
  label: string
  value: string
  full?: boolean
}) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
