import { NextRequest, NextResponse } from "next/server"
import { getOrderByReference } from "@/lib/orders"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")
  if (!reference) return NextResponse.json({ error: "reference is required." }, { status: 400 })

  const order = await getOrderByReference(reference)
  if (!order) {
    return NextResponse.json({ order: null })
  }
  return NextResponse.json({
    order: {
      reference: order.reference,
      status: order.status,
      provider: order.provider,
      total: order.total,
      createdAt: order.createdAt,
    },
  })
}