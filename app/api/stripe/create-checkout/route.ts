import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeConfig, isStripeConfigured, generateOrderReference } from "@/lib/payments"

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
    const items = Array.isArray(body?.items) ? body.items : []
    const successUrl = body?.successUrl || `${request.nextUrl.origin}/checkout/success?provider=stripe`
    const cancelUrl = body?.cancelUrl || `${request.nextUrl.origin}/checkout?payment=cancelled`

    if (items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }

    const stripe = new Stripe(getStripeConfig().secretKey)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: generateOrderReference(),
      line_items: items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
        quantity: Math.max(1, item.quantity || 1),
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
        },
      })),
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start Stripe checkout." },
      { status: 500 }
    )
  }
}