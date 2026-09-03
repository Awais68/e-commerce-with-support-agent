import { NextResponse } from "next/server"
import { getStoreProductById } from "@/lib/store"

export const runtime = "nodejs"
export const revalidate = 300

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getStoreProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (error) {
    console.error("Product API error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}