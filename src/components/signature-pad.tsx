"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eraser, PenLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signPlan } from "@/app/plan/actions"

export function SignaturePad({ partnerName }: { partnerName: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawing = React.useRef(false)
  const last = React.useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = React.useState(false)
  const [name, setName] = React.useState(partnerName)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  const paintBackground = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Sätt upp canvas i rätt upplösning (high-DPI) vid montering.
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineWidth = 2.4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#1c1917"
    }
    paintBackground()
  }, [paintBackground])

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx || !last.current) return
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasInk) setHasInk(true)
  }

  function end() {
    drawing.current = false
    last.current = null
  }

  function clear() {
    paintBackground()
    setHasInk(false)
    setError(null)
  }

  function sign() {
    setError(null)
    if (!name.trim()) return setError("Ange ditt namn.")
    if (!hasInk) return setError("Skriv under i rutan först.")
    const image = canvasRef.current?.toDataURL("image/png")
    if (!image) return
    startTransition(async () => {
      try {
        await signPlan(name, image)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Något gick fel.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sign-name">Ditt namn</Label>
        <Input
          id="sign-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="För- och efternamn"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Signatur</Label>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Eraser className="size-3.5" /> Rensa
          </button>
        </div>
        <div className="overflow-hidden rounded-sm border bg-white">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="h-44 w-full touch-none"
            style={{ cursor: "crosshair" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Skriv under med finger eller mus i rutan ovan.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={sign} disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <PenLine />}
        Godkänn och skriv under
      </Button>
    </div>
  )
}
