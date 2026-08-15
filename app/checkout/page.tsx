"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"

export default function CheckoutPage() {
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const { items: cartItems, subtotal } = useCart()

  const shipping = 0 // Complimentary
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <Link href="/" className="font-serif text-xl lg:text-2xl tracking-[0.3em] uppercase">
              Awais Niaz
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Forms */}
          <div className="order-2 lg:order-1">
            {/* Steps indicator */}
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => setStep("shipping")}
                className={`text-sm tracking-[0.15em] uppercase transition-colors ${
                  step === "shipping" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Shipping
              </button>
              <div className="h-px w-8 bg-border" />
              <button
                onClick={() => setStep("payment")}
                className={`text-sm tracking-[0.15em] uppercase transition-colors ${
                  step === "payment" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Payment
              </button>
            </div>

            {step === "shipping" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-serif text-2xl mb-8">Shipping Information</h2>

                {/* Contact */}
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-xs tracking-wide">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="mt-1.5 border-border/50 focus:border-foreground"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs tracking-wide">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="mt-1.5 border-border/50 focus:border-foreground"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-xs tracking-wide">
                          First Name
                        </Label>
                        <Input id="firstName" className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-xs tracking-wide">
                          Last Name
                        </Label>
                        <Input id="lastName" className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-xs tracking-wide">
                        Address
                      </Label>
                      <Input id="address" className="mt-1.5 border-border/50 focus:border-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="apartment" className="text-xs tracking-wide">
                        Apartment, suite, etc. (optional)
                      </Label>
                      <Input id="apartment" className="mt-1.5 border-border/50 focus:border-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs tracking-wide">
                          City
                        </Label>
                        <Input id="city" className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs tracking-wide">
                          State
                        </Label>
                        <Input id="state" className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-xs tracking-wide">
                          ZIP Code
                        </Label>
                        <Input id="zip" className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setStep("payment")} className="w-full py-6 text-sm tracking-[0.2em] uppercase">
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="font-serif text-2xl mb-8">Payment Details</h2>

                <div className="space-y-4 mb-8">
                  <div>
                    <Label htmlFor="cardName" className="text-xs tracking-wide">
                      Name on Card
                    </Label>
                    <Input id="cardName" className="mt-1.5 border-border/50 focus:border-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-xs tracking-wide">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      className="mt-1.5 border-border/50 focus:border-foreground"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-xs tracking-wide">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        className="mt-1.5 border-border/50 focus:border-foreground"
                        placeholder="MM / YY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="text-xs tracking-wide">
                        CVC
                      </Label>
                      <Input id="cvc" className="mt-1.5 border-border/50 focus:border-foreground" placeholder="123" />
                    </div>
                  </div>
                </div>

                <div className="border border-border p-4 mb-8">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By placing your order, you agree to our{" "}
                    <Link href="#" className="underline underline-offset-2">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                <Button className="w-full py-6 text-sm tracking-[0.2em] uppercase">
                  Place Order — ${total.toLocaleString()}
                </Button>

                <button
                  onClick={() => setStep("shipping")}
                  className="w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Shipping
                </button>
              </motion.div>
            )}
          </div>

          {/* Right - Order Summary - converted to Next.js Image with lazy loading */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

              <div className="space-y-6 mb-8">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 bg-muted flex-shrink-0 relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm">${item.price.toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-muted">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All orders include complimentary shipping and signature gift packaging. Expected delivery within 5-7
                  business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
