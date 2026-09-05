import { NextRequest, NextResponse } from "next/server"
import { getOrderByReference, getShipmentByOrderRef } from "@/lib/orders"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * References are short and time-based, so a lookup endpoint keyed only on the
 * reference is enumerable. Cheap per-IP throttle + a response that carries no
 * contact details keeps a scrape from being worth anything.
 */
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key)
    }
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  stripe: "Card (Stripe)",
  nayapay: "NayaPay",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  paid: "Paid",
  dispatched: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")?.trim()
  if (!reference) return NextResponse.json({ error: "reference is required." }, { status: 400 })

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many lookups. Please try again in a minute." }, { status: 429 })
  }

  const order = await getOrderByReference(reference)
  if (!order) {
    return NextResponse.json({ order: null })
  }

  const shipment = await getShipmentByOrderRef(order.reference)
  const address = order.shippingAddress as Record<string, string>
  const isCod = order.provider === "cod"

  return NextResponse.json({
    order: {
      reference: order.reference,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status] ?? order.status,
      provider: order.provider,
      paymentMethod: PAYMENT_LABEL[order.provider] ?? order.provider,
      isCod,
      // For COD the money is still owed until the rider collects it.
      amountDue: isCod && order.status !== "paid" && order.status !== "delivered" ? order.total : 0,
      currency: order.currency,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      items: order.items,
      // City only — never the street, phone or email of the customer.
      city: address?.city ?? "",
      createdAt: order.createdAt,
      shipment: shipment
        ? {
            courier: shipment.courier,
            trackingNo: shipment.trackingNo,
            status: shipment.status,
            eta: shipment.eta,
            timeline: shipment.timeline,
          }
        : null,
    },
  })
}
