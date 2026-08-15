"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

function SuccessContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider") || "card"
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto text-center py-24 px-6"
    >
      <>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-foreground text-background"
        >
          <Check className="h-8 w-8" />
        </motion.div>
        <h1 className="font-serif text-4xl mb-4">Order Confirmed</h1>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Thank you for your purchase. Your payment was processed securely via{" "}
          <span className="uppercase tracking-widest text-foreground">{provider}</span>.
        </p>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          A confirmation email with your order details and tracking information will follow shortly.
        </p>
        <Link href="/shop">
          <Button className="py-6 px-10 text-sm tracking-[0.2em] uppercase">
            Continue Shopping
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </Link>
      </>
    </motion.div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}