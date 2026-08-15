"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ProductCard } from "./product-card"
import { products } from "@/lib/products"

const featuredIds = [
  "silk-evening-coat",
  "cashmere-wrap-dress",
  "girls-floral-dress",
  "mens-wool-overcoat",
  "mens-cashmere-sweater",
  "womens-satin-heels",
]

const featuredProducts = featuredIds
  .map((id) => products.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    hoverImage: p.hoverImage,
    category: p.category,
  }))

export function CollectionGrid() {
  const displayProducts = featuredProducts.length >= 6 ? featuredProducts : products.slice(0, 6).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    hoverImage: p.hoverImage,
    category: p.category,
  }))

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="font-serif text-3xl lg:text-5xl mb-4">Curated Selection</h2>
          <p className="text-muted-foreground tracking-wide max-w-md mx-auto">
            Each piece tells a story of meticulous craftsmanship
          </p>
        </motion.div>

        {/* Asymmetrical grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* First row - offset layout */}
          <div className="lg:pt-12">
            <ProductCard {...displayProducts[0]} index={0} />
          </div>
          <div>
            <ProductCard {...displayProducts[1]} index={1} />
          </div>
          <div className="lg:pt-24">
            <ProductCard {...displayProducts[2]} index={2} />
          </div>

          {/* Second row - different offset */}
          <div>
            <ProductCard {...displayProducts[3]} index={3} />
          </div>
          <div className="lg:pt-16">
            <ProductCard {...displayProducts[4]} index={4} />
          </div>
          <div className="lg:-mt-8">
            <ProductCard {...displayProducts[5]} index={5} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 lg:mt-24"
        >
          <Link
            href="/shop"
            className="inline-flex items-center text-sm tracking-[0.2em] uppercase border-b border-foreground pb-1 hover:border-transparent transition-colors duration-300"
          >
            View Full Collection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
