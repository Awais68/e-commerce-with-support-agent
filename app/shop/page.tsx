import { Suspense } from "react"
import { ShopGrid } from "@/components/shop-grid"
import { getStoreCatalog } from "@/lib/store"

export const revalidate = 3600

export default async function ShopPage() {
  const products = await getStoreCatalog()
  return (
    <Suspense fallback={null}>
      <ShopGrid products={products} />
    </Suspense>
  )
}