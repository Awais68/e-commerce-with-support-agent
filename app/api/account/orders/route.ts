import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { getUserOrders } from "@/lib/orders"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const orders = await getUserOrders(user.id)
  return NextResponse.json({ orders })
}