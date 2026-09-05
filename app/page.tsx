import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { HeroSection } from "@/components/hero-section"
import { CollectionGrid } from "@/components/collection-grid"
import { TrendingNow } from "@/components/trending-now"
import { HeritageSection } from "@/components/heritage-section"
import { PremiumFooter } from "@/components/premium-footer"
import { getStoreCatalog } from "@/lib/store"

export const revalidate = 3600

export default async function Home() {
  const catalog = await getStoreCatalog()
  const trendingProducts = catalog.slice(0, 16).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    hoverImage: p.hoverImage,
    category: p.category,
  }))

  return (
    <main className="min-h-screen">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <CollectionGrid />
      <TrendingNow products={trendingProducts} />
      <HeritageSection />
      <PremiumFooter />
    </main>
  )
}
