import { NextRequest, NextResponse } from "next/server"
import {
  addShipmentEvent,
  createShipment,
  getOrderByReference,
  getShipmentByOrderRef,
  markOrderPaid,
  nowStamp,
  setOrderStatus,
} from "@/lib/orders"
import { getCodConfig } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Ops-facing stages a parcel moves through after the order is confirmed. */
const STAGES: Record<string, { orderStatus: string; label: string }> = {
  dispatched: { orderStatus: "dispatched", label: "Dispatched" },
  out_for_delivery: { orderStatus: "out_for_delivery", label: "Out for delivery" },
  delivered: { orderStatus: "delivered", label: "Delivered" },
  cancelled: { orderStatus: "cancelled", label: "Cancelled" },
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_API_KEY
  if (secret && request.headers.get("x-internal-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const reference = String(body?.reference || "").trim()
  const stageKey = String(body?.stage || "dispatched")
  const stage = STAGES[stageKey]

  if (!reference || !stage) {
    return NextResponse.json(
      { error: `reference and a valid stage (${Object.keys(STAGES).join(", ")}) are required.` },
      { status: 400 }
    )
  }

  const order = await getOrderByReference(reference)
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 })

  const courier = String(body?.courier || "")
  const trackingNo = String(body?.trackingNo || "")
  const eta = String(body?.eta || "")
  const note = String(body?.note || "")

  const event = { status: stage.label, at: nowStamp(), ...(note ? { note } : {}) }

  const existing = await getShipmentByOrderRef(reference)
  const shipment = existing
    ? await addShipmentEvent(reference, event, { courier, trackingNo, eta })
    : await createShipment({
        orderId: order.id,
        orderRef: reference,
        courier: courier || getCodConfig().courier,
        trackingNo,
        status: stage.label,
        eta,
        timeline: [event],
      })

  await setOrderStatus(reference, stage.orderStatus)
  // Cash changes hands at the door — delivery is what settles a COD order.
  if (stageKey === "delivered" && order.provider === "cod") {
    await markOrderPaid(reference, { providerTransactionId: `COD-${reference}` })
    await setOrderStatus(reference, "delivered")
  }

  return NextResponse.json({ ok: true, reference, stage: stageKey, shipment })
}
