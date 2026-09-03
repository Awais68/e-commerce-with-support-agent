"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

interface OrderStatus {
  reference: string
  status: string
  provider: string
  total: number
  createdAt: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider") || "card"
  const reference = searchParams.get("reference") || ""
  const transactionId = searchParams.get("transactionId") || ""
  const { clearCart } = useCart()

  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(Boolean(reference))

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (!reference) return

    const finalize = async () => {
      if (provider === "nayapay" && transactionId) {
        await fetch(
          `/api/nayapay/verify-transaction?transactionId=${encodeURIComponent(transactionId)}&reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" }
        ).catch(() => {})
      }

      let attempts = 0
      const poll = async () => {
        const res = await fetch(`/api/orders/lookup?reference=${encodeURIComponent(reference)}`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (data?.order) {
          setOrder(data.order)
          if (data.order.status === "paid" || attempts >= 6) {
            setLoading(false)
            return
          }
        } else if (attempts >= 6) {
          setLoading(false)
          return
        }
        attempts += 1
        setTimeout(poll, 1000)
      }
      poll()
    }
    finalize()
  }, [reference, provider, transactionId])

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

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground my-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming your order…
          </div>
        ) : order ? (
          <div className="my-8 border border-border p-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              Order Number
            </div>
            <p className="font-mono text-lg">{order.reference}</p>
            <p className="text-sm text-muted-foreground mt-2">Rs. {order.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-4">
              A confirmation email with your order details and tracking information will follow shortly.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
            A confirmation email with your order details and tracking information will follow shortly.
          </p>
        )}

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
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}