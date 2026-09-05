"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ParticleCanvas } from "./particle-canvas"
import { QuickActions } from "./product-quick-actions"
import { cn } from "@/lib/utils"

export interface TrendingProduct {
  id: string
  name: string
  price: number
  image: string
  hoverImage?: string
  category: string
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

function NeoCard({ product }: { product: TrendingProduct }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div variants={item} className="group">
      <div
        className={cn(
          "relative rounded-[28px] p-3 transition-shadow duration-500",
          "bg-background",
          "shadow-[8px_8px_20px_rgba(0,0,0,0.08),-8px_-8px_20px_rgba(255,255,255,0.75)]",
          "dark:shadow-[8px_8px_20px_rgba(0,0,0,0.55),-8px_-8px_20px_rgba(255,255,255,0.04)]",
          "hover:shadow-[4px_4px_12px_rgba(0,0,0,0.1),-4px_-4px_12px_rgba(255,255,255,0.8)]",
          "dark:hover:shadow-[4px_4px_12px_rgba(0,0,0,0.6),-4px_-4px_12px_rgba(255,255,255,0.05)]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-muted">
          <Link href={`/product/${product.id}`} className="absolute inset-0 z-0 block">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className={cn(
                "object-cover transition-opacity duration-700 ease-in-out",
                isHovered ? "opacity-0" : "opacity-100"
              )}
            />
            <Image
              src={product.hoverImage || product.image || "/placeholder.svg"}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className={cn(
                "object-cover absolute inset-0 transition-opacity duration-700 ease-in-out",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          </Link>
          <QuickActions
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image || "/placeholder.svg"}
            className="opacity-0 max-sm:opacity-100 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        <Link href={`/product/${product.id}`} className="block space-y-0.5 px-2 pb-2 pt-3">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{product.category}</p>
          <h3 className="font-serif text-sm lg:text-base line-clamp-1 group-hover:underline underline-offset-4 transition-all">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">Rs. {product.price.toLocaleString()}</p>
        </Link>
      </div>
    </motion.div>
  )
}

export function TrendingNow({ products }: { products: TrendingProduct[] }) {
  const items = products.slice(0, 16)
  if (items.length === 0) return null

  return (
    <section className="relative overflow-hidden py-24 lg:py-32 px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-60">
        <ParticleCanvas color="#c9a35f" count={70} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16 lg:mb-20"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Shop the Edit</p>
          <h2 className="font-serif text-3xl lg:text-5xl mb-4">Trending Now</h2>
          <p className="text-muted-foreground tracking-wide max-w-md mx-auto">
            Sixteen pieces our clients are reaching for this season
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7"
        >
          {items.map((product) => (
            <NeoCard key={product.id} product={product} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-16 lg:mt-20"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase border-b border-foreground pb-1 hover:gap-4 transition-all duration-300"
          >
            View Full Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
