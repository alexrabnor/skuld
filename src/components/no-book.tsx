import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/login/actions"

export function NoBook() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Wallet className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Ingen skuldbok hittades</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Ditt konto är inte kopplat till någon skuldbok ännu. Kontakta
          administratören.
        </p>
      </div>
      <form action={logout}>
        <Button variant="outline" type="submit">
          Logga ut
        </Button>
      </form>
    </div>
  )
}
