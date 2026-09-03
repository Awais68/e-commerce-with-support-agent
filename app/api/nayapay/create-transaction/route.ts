import { NextRequest, NextResponse } from "next/server"
import { getNayapayConfig, isNayapayConfigured, nayapayHeaders, generateOrderReference } from "@/lib/payments"
import { createOrder, type OrderItemInput, type ShippingInput } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isNayapayConfigured()) {
      return NextResponse.json(
        {
          error:
            "NayaPay is not configured. Add NAYAPAY_API_USERNAME, NAYAPAY_API_PASSWORD and NAYAPAY_MERCHANT_ID to your .env.local file.",
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const items = Array.isArray(body?.items) ? (body.items as OrderItemInput[]) : []
    const shipping = body?.shipping as ShippingInput | undefined
    const userId = body?.userId || null
    const amount = Number(body?.amount)
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount." }, { status: 400 })
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }

    const config = getNayapayConfig()
    const origin = request.nextUrl.origin
    const reference = generateOrderReference()

    const order = await createOrder({
      items,
      shipping,
      userId,
      provider: "nayapay",
      reference,
      currency: "PKR",
      status: "pending",
    })
    if (!order) {
      return NextResponse.json({ error: "Could not create your order." }, { status: 500 })
    }

    const payload = {
      amount,
      reference,
      description: `SN Collections order ${reference}`,
      ...(config.currency ? { currency: config.currency } : {}),
      return_urls: {
        success: `${origin}/checkout/success?provider=nayapay&reference=${reference}`,
        failure: `${origin}/checkout?payment=failed`,
        cancel: `${origin}/checkout?payment=cancelled`,
      },
    }

    const res = await fetch(`${config.baseUrl}/transactions`, {
      method: "POST",
      headers: nayapayHeaders(config),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error("NayaPay create-transaction error:", res.status, data)
      return NextResponse.json(
        { error: data?.message || data?.error || "NayaPay could not start the transaction." },
        { status: res.status }
      )
    }

    const token = data?.token || data?.transaction_token
    const transactionId = data?.transaction_id || data?.transactionId || data?.id

    if (!token) {
      console.error("NayaPay create-transaction missing token:", data)
      return NextResponse.json(
        { error: "NayaPay did not return a checkout token. Please check your NayaPay credentials." },
        { status: 502 }
      )
    }

    if (transactionId) {
      await fetch(`${origin}/api/internal/order-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, providerTransactionId: String(transactionId) }),
      }).catch(() => {})
    }

    const checkoutUrl = `${config.checkoutUrl}?token=${encodeURIComponent(token)}`

    return NextResponse.json({ checkoutUrl, transactionId, reference })
  } catch (error) {
    console.error("NayaPay create-transaction error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start NayaPay checkout." },
      { status: 500 }
    )
  }
}