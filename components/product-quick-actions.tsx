"use client"

import type { MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  id: string
  name: string
  price: number
  image: string
  size?: string
  color?: string
  className?: string
}

export function QuickActions({
  id,
  name,
  price,
  image,
  size = "One Size",
  color = "",
  className,
}: QuickActionsProps) {
  const { addItem } = useCart()
  const router = useRouter()

  const addToBag = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id, name, price, size, color, image })
  }

  const buyNow = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id, name, price, size, color, image })
    router.push("/checkout")
  }

  return (
    <div className={cn("absolute inset-x-3 bottom-3 z-10 flex gap-2", className)}>
      <button
        onClick={addToBag}
        className="flex-1 bg-background/95 text-foreground py-3 text-[11px] uppercase tracking-widest backdrop-blur transition-colors hover:bg-foreground hover:text-background"
      >
        Add to Bag
      </button>
      <button
        onClick={buyNow}
        className="bg-foreground/95 text-background px-4 py-3 text-[11px] uppercase tracking-widest backdrop-blur transition-colors hover:bg-background hover:text-foreground"
      >
        Buy Now
      </button>
    </div>
  )
}