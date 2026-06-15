import { Wallet } from "lucide-react"

export function NoBook() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-sm bg-muted">
        <Wallet className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="font-display text-2xl">Ingen skuldbok hittades</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Det finns ingen skuldbok kopplad ännu.
        </p>
      </div>
    </div>
  )
}
