import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import {
  getStripeConfig,
  isStripeConfigured,
  generateOrderReference,
  getBaseUrl,
  toAbsoluteImageUrl,
} from "@/lib/payments"
import { createOrder, type OrderItemInput, type ShippingInput } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const items = Array.isArray(body?.items) ? (body.items as OrderItemInput[]) : []
    const shipping = body?.shipping as ShippingInput | undefined
    const userId = body?.userId || null
    const email = shipping?.email || body?.email || ""

    if (items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }

    const reference = generateOrderReference()
    const baseUrl = getBaseUrl(request.nextUrl.origin)

    const stripe = new Stripe(getStripeConfig().secretKey)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?provider=stripe&reference=${reference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?payment=cancelled`,
      client_reference_id: reference,
      customer_email: email || undefined,
      metadata: {
        orderReference: reference,
        userId: userId || "",
      },
      line_items: items.map((item) => {
        const image = toAbsoluteImageUrl(item.image, baseUrl)
        return {
          quantity: Math.max(1, item.quantity || 1),
          price_data: {
            currency: "pkr",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.name,
              ...(image ? { images: [image] } : {}),
            },
          },
        }
      }),
    })

    const order = await createOrder({
      items,
      shipping,
      userId,
      provider: "stripe",
      providerSessionId: session.id,
      reference,
      currency: "pkr",
      status: "pending",
    })
    if (!order) {
      return NextResponse.json({ error: "Could not create your order." }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id, reference })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start Stripe checkout." },
      { status: 500 }
    )
  }
}