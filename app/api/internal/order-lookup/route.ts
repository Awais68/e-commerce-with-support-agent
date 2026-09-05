import { NextRequest, NextResponse } from "next/server"
import { getOrderByReference, getOrdersByEmail, getShipmentByOrderRef, type Order } from "@/lib/orders"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Read-only order feed for the support agent's `lookup_order` tool (Phase 2).
 *
 * Authenticated with the same shared secret the Next -> FastAPI hop uses, so
 * the support backend can call it without a customer session. Returns city but
 * never street/phone — an agent transcript is not the place for a full address.
 */
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

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  stripe: "Card (Stripe)",
  nayapay: "NayaPay",
}

function authorized(request: NextRequest): boolean {
  const secret = process.env.SUPPORT_API_KEY || process.env.INTERNAL_API_KEY
  if (!secret) return false
  const header =
    request.headers.get("x-api-key") ||
    request.headers.get("x-internal-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  return header === secret
}

async function serialize(order: Order) {
  const shipment = await getShipmentByOrderRef(order.reference)
  const address = order.shippingAddress as Record<string, string>
  const isCod = order.provider === "cod"
  return {
    reference: order.reference,
    status: order.status,
    statusLabel: STATUS_LABEL[order.status] ?? order.status,
    paymentMethod: PAYMENT_LABEL[order.provider] ?? order.provider,
    isCod,
    amountDue: isCod && order.status !== "paid" && order.status !== "delivered" ? order.total : 0,
    currency: order.currency,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      size: item.size ?? null,
      color: item.color ?? null,
    })),
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
  }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const reference = params.get("reference")?.trim()
  const email = params.get("email")?.trim()

  if (reference) {
    const order = await getOrderByReference(reference)
    if (!order) return NextResponse.json({ orders: [] })
    return NextResponse.json({ orders: [await serialize(order)] })
  }

  if (email) {
    const limit = Math.min(Number(params.get("limit")) || 5, 20)
    const orders = await getOrdersByEmail(email, limit)
    return NextResponse.json({ orders: await Promise.all(orders.map(serialize)) })
  }

  return NextResponse.json({ error: "reference or email is required." }, { status: 400 })
}
