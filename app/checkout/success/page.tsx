"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ArrowRight, Loader2, Package, Truck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

interface OrderStatus {
  reference: string
  status: string
  statusLabel?: string
  provider: string
  paymentMethod?: string
  isCod?: boolean
  amountDue?: number
  total: number
  createdAt: string
  shipment?: { courier: string; trackingNo: string; status: string; eta: string } | null
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider") || "card"
  const reference = searchParams.get("reference") || ""
  const transactionId = searchParams.get("transactionId") || ""
  const { clearCart } = useCart()

  const isCod = provider === "cod"
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
          // A COD order is final the moment it is written — nothing to wait for.
          if (isCod || data.order.status === "paid" || attempts >= 6) {
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
  }, [reference, provider, transactionId, isCod])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto text-center py-24 px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-foreground text-background"
      >
        <Check className="h-8 w-8" />
      </motion.div>
      <h1 className="font-serif text-4xl mb-4">Order Confirmed</h1>

      {isCod ? (
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Your order is placed with{" "}
          <span className="uppercase tracking-widest text-foreground">Cash on Delivery</span>. Please keep the cash ready
          — our courier will call you before delivery.
        </p>
      ) : (
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Thank you for your purchase. Your payment was processed securely via{" "}
          <span className="uppercase tracking-widest text-foreground">{provider}</span>.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground my-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming your order…
        </div>
      ) : order ? (
        <div className="my-8 border border-border p-6 text-left">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Package className="h-4 w-4" />
            Order Number
          </div>
          <p className="font-mono text-lg text-center">{order.reference}</p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span>{order.paymentMethod ?? provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Total</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
            {order.isCod && (order.amountDue ?? 0) > 0 && (
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payable on delivery
                </span>
                <span>Rs. {(order.amountDue ?? 0).toLocaleString()}</span>
              </div>
            )}
            {order.shipment?.courier && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Courier
                </span>
                <span>{order.shipment.courier}</span>
              </div>
            )}
            {order.shipment?.eta && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected delivery</span>
                <span>{order.shipment.eta}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Save your order number. You can track this order any time on the{" "}
            <Link href={`/track?reference=${encodeURIComponent(order.reference)}`} className="underline underline-offset-2">
              tracking page
            </Link>{" "}
            or by sending it to our concierge chat.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          A confirmation email with your order details and tracking information will follow shortly.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {order && (
          <Link href={`/track?reference=${encodeURIComponent(order.reference)}`}>
            <Button variant="outline" className="w-full sm:w-auto py-6 px-8 text-sm tracking-[0.2em] uppercase">
              Track Order
            </Button>
          </Link>
        )}
        <Link href="/shop">
          <Button className="w-full sm:w-auto py-6 px-10 text-sm tracking-[0.2em] uppercase">
            Continue Shopping
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </Link>
      </div>
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
