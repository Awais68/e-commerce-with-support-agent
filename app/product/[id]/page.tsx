"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { ProductGallery } from "@/components/product-gallery"
import { SizeSelector } from "@/components/size-selector"
import { ColorSelector } from "@/components/color-selector"
import { ProductDetailsAccordion } from "@/components/product-details-accordion"
import { RelatedProducts } from "@/components/related-products"
import { getProductById, getRelatedProducts } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { ChevronRight } from "lucide-react"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const handleAddToBag = () => {
    const size = selectedSize || product.sizes.find((s) => s.available)?.size || ""
    const color = selectedColor || product.colors.find((c) => c.available)?.name || ""
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      color,
      image: product.image,
    })
  }

  const relatedProducts = getRelatedProducts(id, 4)

  const accordionItems = [
    {
      title: "Details",
      content: product.details,
    },
    {
      title: "Materials",
      content: product.materials,
    },
    {
      title: "Care",
      content: product.care,
    },
    {
      title: "Shipping & Returns",
      content: [
        "Complimentary shipping on all orders",
        "Express delivery available",
        "Free returns within 30 days",
        "Items must be unworn with tags attached",
      ],
    },
  ]

  const galleryImages = [
    product.image,
    product.hoverImage,
    product.image.replace("query=", "query=detail "),
    product.hoverImage.replace("query=", "query=closeup "),
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductGallery images={galleryImages} productName={product.name} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:sticky lg:top-32 lg:self-start space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
              <p className="text-xl">€{product.price.toLocaleString()}</p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>

            {/* Color Selector */}
            {product.colors.length > 0 && <ColorSelector colors={product.colors} onSelect={setSelectedColor} />}

            {/* Size Selector */}
            <SizeSelector sizes={product.sizes} onSelect={setSelectedSize} />

            {/* Add to Bag */}
            <motion.button
              onClick={handleAddToBag}
              className="w-full py-4 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              Add to Bag
            </motion.button>

            {/* Made In */}
            <p className="text-xs text-muted-foreground text-center tracking-widest">Made in {product.madeIn}</p>

            {/* Accordion */}
            <ProductDetailsAccordion items={accordionItems} />
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      <PremiumFooter />
    </main>
  )
}
