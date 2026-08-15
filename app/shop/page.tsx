"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { products, categories } from "@/lib/products"
import { ArrowRight } from "lucide-react"

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProducts = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Banner - already using priority, added sizes */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/shop-hero-luxury-fashion-collection.jpg"
            alt="Shop collection"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>

        <motion.div
          className="relative z-10 text-center text-background px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-6">The Collection</h1>
          <p className="text-lg md:text-xl text-background/80 max-w-xl mx-auto">
            Timeless pieces crafted with intention. Each item represents our commitment to exceptional quality.
          </p>
        </motion.div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-muted">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 ${
                  activeCategory === category
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Product Grid - added lazy loading and responsive sizes */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link href={`/product/${product.id}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        loading="lazy"
                        className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
                      />
                      <Image
                        src={product.hoverImage || "/placeholder.svg"}
                        alt={`${product.name} alternate view`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        loading="lazy"
                        className="object-cover absolute inset-0 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs tracking-widest text-muted-foreground uppercase">{product.category}</p>
                      <h3 className="font-serif text-lg group-hover:underline underline-offset-4 transition-all">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">€{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Heritage CTA */}
      <section className="border-t border-muted py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Crafted with Purpose</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Every piece in our collection carries forward a legacy of Italian craftsmanship spanning over 175 years.
          </p>
          <Link
            href="/heritage"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase border-b border-foreground pb-1 hover:gap-4 transition-all duration-300"
          >
            Discover Our Heritage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}
