import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fel?: string }>
}) {
  const { fel } = await searchParams
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/40">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Wallet className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Skuld</h1>
            <p className="text-sm text-muted-foreground">Logga in för att fortsätta</p>
          </div>
        </div>

        <form action={login} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          {fel && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Fel e-post eller lösenord.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Logga in
          </Button>
        </form>
      </div>
    </div>
  )
}
