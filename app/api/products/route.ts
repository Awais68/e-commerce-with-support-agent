import { NextRequest, NextResponse } from "next/server"
import { getStoreCatalog, getStoreCatalogByCategory } from "@/lib/store"
import { catalogCategories } from "@/lib/catalog"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")
    const products = category ? await getStoreCatalogByCategory(category) : await getStoreCatalog()
    return NextResponse.json({ products, categories: catalogCategories })
  } catch (error) {
    console.error("Catalog API error:", error)
    return NextResponse.json({ products: [], categories: catalogCategories }, { status: 500 })
  }
}