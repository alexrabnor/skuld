"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Activity,
  Wallet,
  LogOut,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { QuickActions } from "@/components/quick-actions"
import { logout } from "@/app/login/actions"

const NAV = [
  { href: "/", label: "Översikt", icon: LayoutDashboard },
  { href: "/transaktioner", label: "Transaktioner", icon: ListOrdered },
  { href: "/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/tidslinje", label: "Tidslinje", icon: Activity },
]

export function AppShell({
  partnerName,
  children,
}: {
  partnerName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-sm bg-brand text-brand-foreground">
              <Wallet className="size-[18px]" />
            </div>
            <div className="leading-none">
              <p className="font-display text-2xl leading-none">Skuld</p>
              <p className="kicker mt-1 text-muted-foreground">{partnerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* desktop-nav */}
            <nav className="mr-1 hidden items-center gap-1 sm:flex">
              {NAV.map((item) => {
                const active = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className="kicker rounded-sm"
                  >
                    <Link href={item.href}>
                      <item.icon /> {item.label}
                    </Link>
                  </Button>
                )
              })}
            </nav>
            <ThemeToggle />
            <form action={logout}>
              <Button variant="ghost" size="icon" aria-label="Logga ut" type="submit">
                <LogOut />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:pb-12">{children}</main>

      <QuickActions partnerName={partnerName} />

      {/* mobil bottennav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors",
                  active ? "text-brand" : "text-muted-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
