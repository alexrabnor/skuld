"use client"

import { LineChart as LineIcon, BarChart3, PieChart as PieIcon } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BalanceChart, MonthlyChart, CategoryChart } from "@/components/charts"
import type { Category } from "@/lib/types"

export function StatsCharts({
  balance,
  monthly,
  categories,
}: {
  balance: { date: string; saldo: number }[]
  monthly: { month: string; belopp: number }[]
  categories: { category: Category; total: number }[]
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <Tabs defaultValue="saldo">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="saldo" className="flex-1">
            <LineIcon /> Saldo
          </TabsTrigger>
          <TabsTrigger value="manad" className="flex-1">
            <BarChart3 /> Per månad
          </TabsTrigger>
          <TabsTrigger value="kategori" className="flex-1">
            <PieIcon /> Kategorier
          </TabsTrigger>
        </TabsList>
        <TabsContent value="saldo">
          <p className="mb-3 text-xs text-muted-foreground">
            Skuldens utveckling över tid.
          </p>
          <BalanceChart data={balance} />
        </TabsContent>
        <TabsContent value="manad">
          <p className="mb-3 text-xs text-muted-foreground">
            Utlagt belopp per månad.
          </p>
          <MonthlyChart data={monthly} />
        </TabsContent>
        <TabsContent value="kategori">
          <p className="mb-3 text-xs text-muted-foreground">
            Fördelning av utlägg per kategori.
          </p>
          <CategoryChart data={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
