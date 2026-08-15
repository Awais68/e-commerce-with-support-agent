"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

type PaymentMethod = "nayapay" | "stripe" | "card"

const paymentMethods: { id: PaymentMethod; name: string; description: string }[] = [
  {
    id: "nayapay",
    name: "NayaPay",
    description: "Pay instantly with your NayaPay wallet or linked Visa / Mastercard.",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Secure card payments processed by Stripe. Global cards supported.",
  },
  {
    id: "card",
    name: "Debit / Credit Card",
    description: "Enter your card details directly at checkout.",
  },
]

export default function CheckoutPage() {
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const { items: cartItems, subtotal, clearCart } = useCart()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("nayapay")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const shipping = 0 // Complimentary
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  const handleStripe = async () => {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data?.error || "Could not start Stripe checkout.")
        return
      }
      window.location.href = data.url
    } catch {
      setError("Could not start Stripe checkout. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleNayapay = async () => {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/nayapay/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        setError(data?.error || "Could not start NayaPay checkout.")
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      setError("Could not start NayaPay checkout. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod === "stripe") return handleStripe()
    if (paymentMethod === "nayapay") return handleNayapay()

    // Manual card fallback
    setProcessing(true)
    setError(null)
    await new Promise((resolve) => setTimeout(resolve, 800))
    clearCart()
    setProcessing(false)
    setOrderPlaced(true)
  }

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
              SN Collections
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        {orderPlaced ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center py-16"
          >
            <h1 className="font-serif text-3xl mb-4">Thank You</h1>
            <p className="text-muted-foreground mb-8">
              Your order has been received. A confirmation has been sent to your email.
            </p>
            <Link href="/shop">
              <Button className="py-6 px-10 text-sm tracking-[0.2em] uppercase">Continue Shopping</Button>
            </Link>
          </motion.div>
        ) : (
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

              {error && (
                <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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

                  {/* Payment method selector */}
                  <div className="space-y-3 mb-8">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "w-full text-left border p-4 transition-all duration-300",
                          paymentMethod === method.id
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm tracking-widest uppercase">{method.name}</span>
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full border flex items-center justify-center",
                              paymentMethod === method.id ? "border-foreground" : "border-muted-foreground/40"
                            )}
                          >
                            {paymentMethod === method.id && <span className="h-2 w-2 rounded-full bg-foreground" />}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{method.description}</p>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
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
                      <p className="text-xs text-muted-foreground">
                        Prefer instant checkout? Use <strong>NayaPay</strong> or <strong>Stripe</strong> for a secure
                        hosted payment page.
                      </p>
                    </div>
                  )}

                  <div className="border border-border p-4 mb-8">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By placing your order, you agree to our{" "}
                      <Link href="/terms" className="underline underline-offset-2">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={processing || cartItems.length === 0}
                    className="w-full py-6 text-sm tracking-[0.2em] uppercase"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      `Place Order — $${total.toLocaleString()}`
                    )}
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
        )}
      </main>
    </div>
  )
}