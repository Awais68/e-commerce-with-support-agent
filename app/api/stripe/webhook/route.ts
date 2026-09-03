import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripeConfig } from "@/lib/payments"
import { getOrderByProviderSession, markOrderPaid } from "@/lib/orders"
import { setOrderUserId } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET in your environment." },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    const rawBody = await request.text()
    const stripe = new Stripe(getStripeConfig().secretKey)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const reference = session.client_reference_id
        const metadataUserId = session.metadata?.userId

        let order = reference ? await getOrderByProviderSession(session.id) : null
        if (!order && reference) {
          order = await markOrderPaid(reference, {
            provider: "stripe",
            providerSessionId: session.id,
            providerTransactionId: String(session.payment_intent ?? ""),
          })
        } else if (order && session.payment_intent && !order.providerTransactionId) {
          order = await markOrderPaid(order.reference, {
            providerTransactionId: String(session.payment_intent),
          })
        }

        if (!order && reference) {
          console.warn(`[stripe-webhook] no order found for reference ${reference}`)
        } else if (order && metadataUserId) {
          await setOrderUserId(order.reference, metadataUserId)
        }

        console.log(`[stripe-webhook] order ${order?.reference ?? reference} marked paid`)
        break
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        const reference = session.client_reference_id
        if (reference) {
          await markOrderPaid(reference, { providerTransactionId: "expired" }).catch(() => {})
          await fetch(`${request.nextUrl.origin}/api/internal/order-cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
          }).catch(() => {})
        }
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 })
  }
}