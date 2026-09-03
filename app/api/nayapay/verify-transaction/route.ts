import { NextRequest, NextResponse } from "next/server"
import { getNayapayConfig, isNayapayConfigured, nayapayHeaders } from "@/lib/payments"
import { getOrderByReference, markOrderPaid, markOrderCancelled } from "@/lib/orders"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    if (!isNayapayConfigured()) {
      return NextResponse.json({ error: "NayaPay is not configured." }, { status: 400 })
    }

    const transactionId = request.nextUrl.searchParams.get("transactionId")
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId is required." }, { status: 400 })
    }

    const config = getNayapayConfig()
    const res = await fetch(`${config.baseUrl}/transactions/${encodeURIComponent(transactionId)}`, {
      method: "GET",
      headers: nayapayHeaders(config),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error("NayaPay verify-transaction error:", res.status, data)
      return NextResponse.json({ error: "Could not verify the NayaPay transaction." }, { status: res.status })
    }

    const status = String(data?.status || data?.transaction_status || "UNKNOWN").toLowerCase()

    const reference = request.nextUrl.searchParams.get("reference") || ""
    if (reference) {
      const order = await getOrderByReference(reference)
      if (order && order.status !== "paid") {
        if (status.includes("success") || status.includes("authorized") || status === "completed") {
          await markOrderPaid(reference, {
            provider: "nayapay",
            providerTransactionId: transactionId,
          })
          console.log(`[nayapay] order ${reference} marked paid`)
        } else if (status.includes("fail") || status.includes("cancel")) {
          await markOrderCancelled(reference)
        }
      }
    }

    return NextResponse.json({
      transactionId,
      status,
      reference: reference || undefined,
      orderStatus: reference ? (await getOrderByReference(reference))?.status : undefined,
      data,
    })
  } catch (error) {
    console.error("NayaPay verify-transaction error:", error)
    return NextResponse.json({ error: "Could not verify the NayaPay transaction." }, { status: 500 })
  }
}