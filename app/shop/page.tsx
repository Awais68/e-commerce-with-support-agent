import { Suspense } from "react"
import { ShopGrid } from "@/components/shop-grid"
import { getCatalog } from "@/lib/catalog"

export const revalidate = 3600

export default async function ShopPage() {
  const products = await getCatalog()
  return (
    <Suspense fallback={null}>
      <ShopGrid products={products} />
    </Suspense>
  )
}