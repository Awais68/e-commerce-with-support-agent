"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Package, Truck, CheckCircle, Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { useAuth } from "@/lib/use-auth"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

interface Order {
  reference: string
  status: string
  total: number
  items: OrderItem[]
  createdAt: string
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return iso
  }
}

function statusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case "paid":
      return { label: "Paid", color: "text-green-600" }
    case "pending":
      return { label: "Processing", color: "text-amber-600" }
    case "refunded":
      return { label: "Refunded", color: "text-muted-foreground" }
    case "cancelled":
      return { label: "Cancelled", color: "text-red-600" }
    default:
      return { label: status, color: "text-muted-foreground" }
  }
}

const StatusIcon = ({ status }: { status: string }) => {
  const s = statusLabel(status).label
  if (s === "Paid") return <CheckCircle className="h-4 w-4" />
  if (s === "Processing") return <Truck className="h-4 w-4" />
  return <Package className="h-4 w-4" />
}

export default function OrdersPage() {
  const router = useRouter()
  const { status: authStatus } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === "loading") return
    if (authStatus === "unauthenticated") {
      router.replace("/account/login")
      return
    }
    fetch("/api/account/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data?.orders ?? [])
        if (data?.orders?.length) setExpandedOrder(data.orders[0].reference)
      })
      .finally(() => setLoading(false))
  }, [authStatus, router])

  if (loading || authStatus === "loading") {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 lg:pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">View your order history</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <h2 className="font-serif text-2xl mb-8">Order History</h2>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="text-sm tracking-[0.15em] uppercase underline underline-offset-4 hover:no-underline transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => {
                    const st = statusLabel(order.status)
                    return (
                      <motion.div
                        key={order.reference}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border border-border"
                      >
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.reference ? null : order.reference)}
                          className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                            <span className="font-mono text-sm">{order.reference}</span>
                            <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                            <span className={`flex items-center gap-1.5 text-sm ${st.color}`}>
                              <StatusIcon status={order.status} />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm hidden sm:block">Rs. {order.total.toLocaleString()}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${
                                expandedOrder === order.reference ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedOrder === order.reference && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 border-t border-border">
                                <div className="space-y-4 pt-6">
                                  {order.items.map((item, i) => (
                                    <Link key={`${item.id}-${i}`} href={`/product/${item.id}`} className="flex gap-4 group">
                                      <div className="w-16 h-20 bg-muted flex-shrink-0 relative overflow-hidden">
                                        <Image
                                          src={item.image || "/placeholder.svg"}
                                          alt={item.name}
                                          fill
                                          sizes="64px"
                                          loading="lazy"
                                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-serif text-sm group-hover:underline">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {item.color && `${item.color} / `}
                                          {item.size}
                                          {item.quantity > 1 && ` × ${item.quantity}`}
                                        </p>
                                      </div>
                                      <div className="text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                                    </Link>
                                  ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t border-border">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Order Total: </span>
                                    <span className="font-medium">Rs. {order.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}