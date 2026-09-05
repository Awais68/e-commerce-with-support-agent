import { NextRequest, NextResponse } from "next/server"
import { generateOrderReference, getCodConfig } from "@/lib/payments"
import {
  computeTotals,
  createOrder,
  createShipment,
  etaFromNow,
  nowStamp,
  type OrderItemInput,
  type ShippingInput,
} from "@/lib/orders"
import { getStoreProductById } from "@/lib/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PHONE_RE = /^[+()\d][\d\s()+-]{8,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateShipping(shipping: ShippingInput | undefined): string | null {
  if (!shipping) return "Shipping details are required."
  if (!shipping.email || !EMAIL_RE.test(shipping.email)) return "A valid email address is required."
  if (!shipping.firstName?.trim() || !shipping.lastName?.trim()) return "Please enter your full name."
  // The rider has to reach the customer, so COD cannot fall back to email only.
  if (!shipping.phone || !PHONE_RE.test(shipping.phone.trim())) {
    return "A valid phone number is required for Cash on Delivery."
  }
  if (!shipping.street?.trim() || !shipping.city?.trim()) return "Please complete your shipping address."
  return null
}

/**
 * Re-prices every line from the catalog. Cash is collected against the total we
 * print on the order, so a tampered client price would be money lost at the door.
 */
async function repriceItems(items: OrderItemInput[]): Promise<{ items: OrderItemInput[]; error?: string }> {
  const priced: OrderItemInput[] = []
  for (const item of items) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
    const product = await getStoreProductById(String(item.id))
    if (!product) return { items: [], error: `"${item.name || item.id}" is no longer available.` }
    if (product.inStock === false) return { items: [], error: `"${product.name}" is out of stock.` }
    priced.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      size: item.size,
      color: item.color,
      image: item.image || product.image,
    })
  }
  return { items: priced }
}

export async function POST(request: NextRequest) {
  try {
    const config = getCodConfig()
    if (!config.enabled) {
      return NextResponse.json({ error: "Cash on Delivery is currently unavailable." }, { status: 400 })
    }

    const body = await request.json()
    const rawItems = Array.isArray(body?.items) ? (body.items as OrderItemInput[]) : []
    const shipping = body?.shipping as ShippingInput | undefined
    const userId = body?.userId || null

    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }

    const invalid = validateShipping(shipping)
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

    const { items, error } = await repriceItems(rawItems)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const totals = computeTotals(items)
    if (totals.total > config.maxOrderValue) {
      return NextResponse.json(
        {
          error: `Cash on Delivery is available on orders up to Rs. ${config.maxOrderValue.toLocaleString()}. Please pay by card for this order.`,
        },
        { status: 400 }
      )
    }

    const reference = generateOrderReference()
    const order = await createOrder({
      items,
      shipping,
      userId,
      provider: "cod",
      reference,
      currency: "PKR",
      // Cash is collected on delivery, so the order is confirmed but unpaid.
      status: "confirmed",
    })
    if (!order) {
      return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 })
    }

    await createShipment({
      orderId: order.id,
      orderRef: order.reference,
      courier: config.courier,
      // Assigned when the parcel is handed to the courier.
      trackingNo: "",
      status: "Order confirmed",
      eta: etaFromNow(config.etaDays),
      timeline: [
        {
          status: "Order confirmed",
          at: nowStamp(),
          note: `Cash on Delivery — Rs. ${Math.round(order.total).toLocaleString()} payable to the rider`,
        },
      ],
    })

    return NextResponse.json({
      reference: order.reference,
      status: order.status,
      total: order.total,
      amountDue: order.total,
      eta: etaFromNow(config.etaDays),
    })
  } catch (err) {
    console.error("COD order error:", err)
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 })
  }
}
