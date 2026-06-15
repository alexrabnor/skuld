"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AddDebtDialog } from "@/components/add-debt-dialog"
import { AddPaymentDialog } from "@/components/add-payment-dialog"

export function QuickActions({ partnerName }: { partnerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 24 }}
      className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6"
    >
      <AddPaymentDialog partnerName={partnerName}>
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full shadow-lg shadow-black/10"
        >
          <Minus /> Återbetalning
        </Button>
      </AddPaymentDialog>
      <AddDebtDialog partnerName={partnerName}>
        <Button size="lg" className="rounded-full shadow-lg shadow-black/20">
          <Plus /> Ny skuld
        </Button>
      </AddDebtDialog>
    </motion.div>
  )
}
