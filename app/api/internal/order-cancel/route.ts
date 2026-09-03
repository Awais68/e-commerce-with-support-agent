import { NextRequest, NextResponse } from "next/server"
import { markOrderCancelled } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const reference = String(body?.reference || "")
  if (!reference) return NextResponse.json({ error: "reference is required." }, { status: 400 })
  await markOrderCancelled(reference)
  return NextResponse.json({ ok: true })
}