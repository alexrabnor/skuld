import {
  Banknote,
  ShoppingCart,
  ShoppingBag,
  Plane,
  UtensilsCrossed,
  CircleDashed,
  type LucideIcon,
} from "lucide-react"
import type { Category } from "@/lib/types"
import { CATEGORY_META } from "@/lib/constants"
import { cn } from "@/lib/utils"

const ICONS: Record<Category, LucideIcon> = {
  "Lån/Pengar": Banknote,
  Mat: ShoppingCart,
  Shopping: ShoppingBag,
  Resor: Plane,
  Restaurang: UtensilsCrossed,
  Övrigt: CircleDashed,
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  const Icon = ICONS[category] ?? CircleDashed
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full",
        className
      )}
      style={{ backgroundColor: CATEGORY_META[category].color + "22" }}
    >
      <Icon className="size-4.5" style={{ color: CATEGORY_META[category].color }} />
    </span>
  )
}
