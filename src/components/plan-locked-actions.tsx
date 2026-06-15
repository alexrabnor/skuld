"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { clearSignature, deletePlan } from "@/app/plan/actions"

export function PlanLockedActions() {
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  function revise() {
    startTransition(async () => {
      await clearSignature()
      router.refresh()
    })
  }

  function remove() {
    if (!confirm("Ta bort hela återbetalningsplanen?")) return
    startTransition(async () => {
      await deletePlan()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={revise} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Pencil />}
        Revidera plan
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={remove}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 /> Ta bort
      </Button>
    </div>
  )
}
