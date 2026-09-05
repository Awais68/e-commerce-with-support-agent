"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

type PaymentMethod = "cod" | "nayapay" | "stripe"

const COD_MAX = Number(process.env.NEXT_PUBLIC_COD_MAX_ORDER_VALUE) || 200000

const paymentMethods: { id: PaymentMethod; name: string; description: string }[] = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: `Pay the rider in cash when your order arrives. Available on orders up to Rs. ${COD_MAX.toLocaleString()}.`,
  },
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
]

interface ShippingState {
  email: string
  phone: string
  firstName: string
  lastName: string
  street: string
  apartment: string
  city: string
  state: string
  zip: string
}

const emptyShipping: ShippingState = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const { items: cartItems, subtotal } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialPaymentError =
    searchParams.get("payment") === "cancelled"
      ? "Your payment was cancelled. No charge was made."
      : searchParams.get("payment") === "failed"
        ? "Your payment could not be completed. Please try again."
        : null

  const [shipping, setShipping] = useState<ShippingState>(emptyShipping)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(initialPaymentError)
  const [userId, setUserId] = useState<string | null>(null)

  const shippingCost = 0 // Complimentary
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shippingCost + tax

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUserId(data.user.id)
          const u = data.user
          setShipping((prev) => ({
            ...prev,
            email: u.email || prev.email,
            firstName: u.firstName || prev.firstName,
            lastName: u.lastName || prev.lastName,
            phone: u.phone || prev.phone,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const setShippingField =
    (key: keyof ShippingState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setShipping((prev) => ({ ...prev, [key]: e.target.value }))

  const validateShipping = (method: PaymentMethod): string | null => {
    if (!shipping.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) return "Please enter a valid email address."
    if (!shipping.firstName || !shipping.lastName) return "Please enter your full name."
    if (!shipping.street || !shipping.city || !shipping.zip) return "Please complete your shipping address."
    // The rider calls before delivery, so COD cannot go out without a number.
    if (method === "cod" && !/^[+()\d][\d\s()+-]{8,}$/.test(shipping.phone.trim())) {
      return "Please enter a valid phone number — it is required for Cash on Delivery."
    }
    return null
  }

  const buildShippingPayload = () => ({
    email: shipping.email,
    firstName: shipping.firstName,
    lastName: shipping.lastName,
    phone: shipping.phone,
    street: shipping.street,
    apartment: shipping.apartment,
    city: shipping.city,
    state: shipping.state,
    zip: shipping.zip,
  })

  const handleStripe = async () => {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })),
          shipping: buildShippingPayload(),
          userId,
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
        body: JSON.stringify({
          amount: total,
          items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })),
          shipping: buildShippingPayload(),
          userId,
        }),
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

  const handleCod = async () => {
    setProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })),
          shipping: buildShippingPayload(),
          userId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.reference) {
        setError(data?.error || "Could not place your Cash on Delivery order.")
        return
      }
      router.push(`/checkout/success?provider=cod&reference=${encodeURIComponent(data.reference)}`)
    } catch {
      setError("Could not place your order. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    const missing = validateShipping(paymentMethod)
    if (missing) {
      setError(missing)
      setStep("shipping")
      return
    }
    if (paymentMethod === "cod") return handleCod()
    if (paymentMethod === "stripe") return handleStripe()
    return handleNayapay()
  }

  return (
    <div className="min-h-screen">
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="order-2 lg:order-1">
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
                        value={shipping.email}
                        onChange={setShippingField("email")}
                        className="mt-1.5 border-border/50 focus:border-foreground"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs tracking-wide">
                        Phone Number{paymentMethod === "cod" ? " (required for Cash on Delivery)" : ""}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shipping.phone}
                        onChange={setShippingField("phone")}
                        className="mt-1.5 border-border/50 focus:border-foreground"
                        placeholder="+92 300 0000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-xs tracking-wide">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={shipping.firstName}
                          onChange={setShippingField("firstName")}
                          className="mt-1.5 border-border/50 focus:border-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-xs tracking-wide">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={shipping.lastName}
                          onChange={setShippingField("lastName")}
                          className="mt-1.5 border-border/50 focus:border-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="street" className="text-xs tracking-wide">
                        Address
                      </Label>
                      <Input
                        id="street"
                        value={shipping.street}
                        onChange={setShippingField("street")}
                        className="mt-1.5 border-border/50 focus:border-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apartment" className="text-xs tracking-wide">
                        Apartment, suite, etc. (optional)
                      </Label>
                      <Input
                        id="apartment"
                        value={shipping.apartment}
                        onChange={setShippingField("apartment")}
                        className="mt-1.5 border-border/50 focus:border-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs tracking-wide">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={shipping.city}
                          onChange={setShippingField("city")}
                          className="mt-1.5 border-border/50 focus:border-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs tracking-wide">
                          State
                        </Label>
                        <Input
                          id="state"
                          value={shipping.state}
                          onChange={setShippingField("state")}
                          className="mt-1.5 border-border/50 focus:border-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-xs tracking-wide">
                          ZIP Code
                        </Label>
                        <Input
                          id="zip"
                          value={shipping.zip}
                          onChange={setShippingField("zip")}
                          className="mt-1.5 border-border/50 focus:border-foreground"
                        />
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

                <div className="border border-border p-4 mb-8">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {paymentMethod === "cod" ? (
                      <>
                        Keep <span className="text-foreground">Rs. {total.toLocaleString()}</span> in cash ready — the rider
                        collects it at your door. Our courier will call the number above before delivery. By placing your
                        order, you agree to our{" "}
                      </>
                    ) : (
                      <>
                        Your card details are entered on the secure hosted payment page of{" "}
                        {paymentMethod === "nayapay" ? "NayaPay" : "Stripe"}. We never see or store your card number. By
                        placing your order, you agree to our{" "}
                      </>
                    )}
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
                    paymentMethod === "cod"
                      ? `Place COD Order — Rs. ${total.toLocaleString()}`
                      : `Place Order — Rs. ${total.toLocaleString()}`
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
                    <div className="text-sm">Rs. {item.price.toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span>Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
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