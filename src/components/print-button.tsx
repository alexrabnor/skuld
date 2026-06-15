"use client"

import * as React from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton({ auto = false }: { auto?: boolean }) {
  React.useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [auto])

  return (
    <Button onClick={() => window.print()} className="print:hidden">
      <Printer /> Skriv ut / Spara som PDF
    </Button>
  )
}
