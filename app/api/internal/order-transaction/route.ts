import { NextRequest, NextResponse } from "next/server"
import { setOrderProviderTransaction } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const reference = String(body?.reference || "")
  const providerTransactionId = String(body?.providerTransactionId || "")
  if (!reference || !providerTransactionId) {
    return NextResponse.json({ error: "reference and providerTransactionId are required." }, { status: 400 })
  }
  await setOrderProviderTransaction(reference, providerTransactionId)
  return NextResponse.json({ ok: true })
}