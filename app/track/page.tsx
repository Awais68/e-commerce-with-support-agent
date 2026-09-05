"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Check, Loader2, Package, Search, Truck, Wallet } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TrackedItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

interface TimelineEvent {
  status: string
  at: string
  note?: string
}

interface TrackedOrder {
  reference: string
  status: string
  statusLabel: string
  paymentMethod: string
  isCod: boolean
  amountDue: number
  total: number
  items: TrackedItem[]
  city: string
  createdAt: string
  shipment: {
    courier: string
    trackingNo: string
    status: string
    eta: string
    timeline: TimelineEvent[]
  } | null
}

const STAGES = ["Order confirmed", "Dispatched", "Out for delivery", "Delivered"]

function stageIndex(order: TrackedOrder): number {
  const status = (order.shipment?.status || order.statusLabel || "").toLowerCase()
  const found = STAGES.findIndex((s) => s.toLowerCase() === status)
  if (found >= 0) return found
  if (order.status === "cancelled") return -1
  return 0
}

function formatDate(value: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function TrackContent() {
  const searchParams = useSearchParams()
  const initialRef = searchParams.get("reference") || ""

  const [reference, setReference] = useState(initialRef)
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = useCallback(async (ref: string) => {
    const trimmed = ref.trim()
    if (!trimmed) {
      setError("Please enter your order number.")
      return
    }
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/lookup?reference=${encodeURIComponent(trimmed)}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Could not look up that order.")
        return
      }
      if (!data?.order) {
        setError(`No order found for ${trimmed}. Please check the number on your confirmation email.`)
        return
      }
      setOrder(data.order as TrackedOrder)
    } catch {
      setError("Could not reach the tracking service. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialRef) return
    const frame = requestAnimationFrame(() => lookup(initialRef))
    return () => cancelAnimationFrame(frame)
  }, [initialRef, lookup])

  const currentStage = order ? stageIndex(order) : -1

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-3xl px-6 lg:px-8 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-4xl mb-3">Track Your Order</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            Enter the order number from your confirmation (it looks like <span className="font-mono">SN-XXXXXXX</span>).
            You can also send the same number to our concierge chat and it will read out the live status.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              lookup(reference)
            }}
            className="flex flex-col sm:flex-row gap-3 mb-10"
          >
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="SN-XXXXXXX"
              className="border-border/50 focus:border-foreground font-mono"
              aria-label="Order number"
            />
            <Button type="submit" disabled={loading} className="py-6 px-8 text-sm tracking-[0.2em] uppercase">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "" : "Track"}
            </Button>
          </form>

          {error && (
            <div className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="border border-border p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Order Number</p>
                    <p className="font-mono text-lg">{order.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Status</p>
                    <p className={cn("text-sm", order.status === "cancelled" ? "text-red-600" : "text-foreground")}>
                      {order.shipment?.status || order.statusLabel}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-muted-foreground">Placed on</span>
                    <span className="sm:block sm:mt-1">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="sm:block sm:mt-1">{order.paymentMethod}</span>
                  </div>
                  {order.shipment?.courier && (
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Courier</span>
                      <span className="sm:block sm:mt-1">{order.shipment.courier}</span>
                    </div>
                  )}
                  <div className="flex justify-between sm:block">
                    <span className="text-muted-foreground">Tracking number</span>
                    <span className="sm:block sm:mt-1 font-mono">
                      {order.shipment?.trackingNo || "Assigned at dispatch"}
                    </span>
                  </div>
                  {order.shipment?.eta && (
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Expected delivery</span>
                      <span className="sm:block sm:mt-1">{order.shipment.eta}</span>
                    </div>
                  )}
                  <div className="flex justify-between sm:block">
                    <span className="text-muted-foreground">Order total</span>
                    <span className="sm:block sm:mt-1">Rs. {order.total.toLocaleString()}</span>
                  </div>
                </div>

                {order.isCod && order.amountDue > 0 && (
                  <div className="mt-6 flex items-center gap-3 bg-muted p-4 text-sm">
                    <Wallet className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Cash on Delivery — keep{" "}
                      <span className="font-medium">Rs. {order.amountDue.toLocaleString()}</span> ready for the rider.
                    </span>
                  </div>
                )}
              </div>

              {order.status !== "cancelled" && (
                <div className="border border-border p-6 mb-8">
                  <h2 className="font-serif text-xl mb-8">Delivery Progress</h2>
                  <div className="flex items-start justify-between gap-2">
                    {STAGES.map((stage, index) => {
                      const done = index <= currentStage
                      return (
                        <div key={stage} className="flex-1 text-center relative">
                          {index > 0 && (
                            <span
                              className={cn(
                                "absolute top-4 right-1/2 h-px w-full",
                                index <= currentStage ? "bg-foreground" : "bg-border"
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full border",
                              done ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                            )}
                          >
                            {index === 3 ? <Check className="h-4 w-4" /> : index === 0 ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                          </span>
                          <p className={cn("mt-3 text-xs leading-tight", done ? "text-foreground" : "text-muted-foreground")}>
                            {stage}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {order.shipment && order.shipment.timeline.length > 0 && (
                <div className="border border-border p-6 mb-8">
                  <h2 className="font-serif text-xl mb-6">Timeline</h2>
                  <ol className="space-y-6">
                    {[...order.shipment.timeline].reverse().map((event, index) => (
                      <li key={`${event.status}-${event.at}-${index}`} className="flex gap-4">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                            index === 0 ? "bg-foreground" : "bg-border"
                          )}
                        />
                        <div>
                          <p className="text-sm">{event.status}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.at}</p>
                          {event.note && <p className="text-xs text-muted-foreground mt-1">{event.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {order.items.length > 0 && (
                <div className="border border-border p-6">
                  <h2 className="font-serif text-xl mb-6">Items</h2>
                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex gap-4">
                        <div className="relative h-24 w-20 flex-shrink-0 bg-muted">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-serif text-sm">{item.name}</p>
                          {(item.color || item.size) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {[item.color, item.size].filter(Boolean).join(" / ")}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
                Something not right with this order? Reach us on{" "}
                <Link href="/contact" className="underline underline-offset-2">
                  the contact page
                </Link>{" "}
                or ask the concierge chat with your order number.
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>

      <PremiumFooter />
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  )
}
