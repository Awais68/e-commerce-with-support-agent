"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Package, Truck, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"

const orders = [
  {
    id: "ORD-2026-1847",
    date: "January 10, 2026",
    status: "Delivered",
    statusColor: "text-green-600",
    total: 3340,
    items: [
      {
        id: "1",
        name: "The Atelier Coat",
        price: 2450,
        size: "M",
        color: "Midnight",
        image: "/luxury-wool-coat-product-image.jpg",
      },
      {
        id: "2",
        name: "Cashmere Knit",
        price: 890,
        size: "S",
        color: "Ivory",
        image: "/cashmere-sweater-ivory.jpg",
      },
    ],
  },
  {
    id: "ORD-2026-1792",
    date: "December 28, 2025",
    status: "In Transit",
    statusColor: "text-amber-600",
    total: 1890,
    items: [
      {
        id: "3",
        name: "Silk Evening Dress",
        price: 1890,
        size: "S",
        color: "Pearl",
        image: "/silk-evening-dress-pearl.jpg",
      },
    ],
  },
  {
    id: "ORD-2025-1654",
    date: "November 15, 2025",
    status: "Delivered",
    statusColor: "text-green-600",
    total: 4250,
    items: [
      {
        id: "4",
        name: "Tailored Blazer",
        price: 1650,
        size: "M",
        color: "Charcoal",
        image: "/tailored-blazer-charcoal.jpg",
      },
      {
        id: "5",
        name: "Wool Trousers",
        price: 750,
        size: "M",
        color: "Charcoal",
        image: "/wool-trousers-charcoal.jpg",
      },
      {
        id: "6",
        name: "Silk Blouse",
        price: 650,
        size: "S",
        color: "Ivory",
        image: "/silk-blouse-ivory.jpg",
      },
      {
        id: "7",
        name: "Leather Belt",
        price: 320,
        size: "M",
        color: "Black",
        image: "/leather-belt-black.jpg",
      },
    ],
  },
]

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle className="h-4 w-4" />
    case "In Transit":
      return <Truck className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(orders[0].id)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          {/* Page header */}
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
                  <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="text-sm tracking-[0.15em] uppercase underline underline-offset-4 hover:no-underline transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border border-border"
                    >
                      {/* Order header */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <span className="font-mono text-sm">{order.id}</span>
                          <span className="text-sm text-muted-foreground">{order.date}</span>
                          <span className={`flex items-center gap-1.5 text-sm ${order.statusColor}`}>
                            <StatusIcon status={order.status} />
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm hidden sm:block">${order.total.toLocaleString()}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${
                              expandedOrder === order.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Order details - converted to Next.js Image with lazy loading */}
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 border-t border-border">
                              <div className="space-y-4 pt-6">
                                {order.items.map((item) => (
                                  <Link key={item.id} href={`/product/${item.id}`} className="flex gap-4 group">
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
                                        {item.color} / {item.size}
                                      </p>
                                    </div>
                                    <div className="text-sm">${item.price.toLocaleString()}</div>
                                  </Link>
                                ))}
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t border-border">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Order Total: </span>
                                  <span className="font-medium">${order.total.toLocaleString()}</span>
                                </div>
                                <div className="flex gap-4">
                                  <button className="text-sm underline underline-offset-4 hover:no-underline transition-all">
                                    View Invoice
                                  </button>
                                  {order.status === "In Transit" && (
                                    <button className="text-sm underline underline-offset-4 hover:no-underline transition-all">
                                      Track Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
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
