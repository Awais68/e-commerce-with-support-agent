"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const timeline = [
  {
    year: "1847",
    title: "The Beginning",
    description:
      "Awais Niaz established our first atelier in Florence, crafting bespoke leather goods for Italian nobility. His vision was simple: create pieces that transcend time.",
  },
  {
    year: "1892",
    title: "Royal Appointment",
    description:
      "Recognized for exceptional craftsmanship, the House of Awais Niaz received its first royal warrant, establishing a tradition of serving discerning clientele across Europe.",
  },
  {
    year: "1935",
    title: "The Signature Stitch",
    description:
      "Third-generation artisan Marco Niaz perfected our distinctive hand-stitching technique, now recognized worldwide as the hallmark of authentic Awais Niaz pieces.",
  },
  {
    year: "1978",
    title: "Global Expansion",
    description:
      "While maintaining our Florence atelier as the heart of production, Awais Niaz opened boutiques in Paris, Milan, and New York, sharing Italian excellence with the world.",
  },
  {
    year: "2024",
    title: "Contemporary Vision",
    description:
      "Today, the fifth generation continues our legacy, blending centuries of tradition with contemporary design to create pieces for the modern connoisseur.",
  },
]

const values = [
  {
    title: "Artisanal Excellence",
    description:
      "Every piece is crafted by master artisans with decades of experience, ensuring unparalleled quality and attention to detail.",
    image: "/artisan-hands-crafting-leather-luxury-goods.jpg",
  },
  {
    title: "Sustainable Luxury",
    description:
      "We source only the finest materials from ethical suppliers, believing true luxury must be responsible to both people and planet.",
    image: "/premium-leather-material-sustainable-luxury.jpg",
  },
  {
    title: "Timeless Design",
    description:
      "Our designs eschew fleeting trends in favor of enduring elegance, creating pieces meant to be treasured for generations.",
    image: "/minimalist-luxury-handbag-timeless-design.jpg",
  },
]

const craftsmen = [
  {
    name: "Lorenzo Benedetti",
    role: "Master Leather Artisan",
    years: "42 years",
    image: "/elderly-italian-craftsman-portrait-luxury.jpg",
  },
  {
    name: "Sofia Marchetti",
    role: "Lead Designer",
    years: "18 years",
    image: "/elegant-italian-woman-designer-portrait.jpg",
  },
  {
    name: "Alessandro Rossi",
    role: "Quality Director",
    years: "28 years",
    image: "/distinguished-italian-man-portrait-luxury.jpg",
  },
]

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - converted to Next.js Image with priority */}
      <section className="relative h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/florence-italy-aerial-view-luxury-historic.jpg"
            alt="Florence, Italy"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.4em] uppercase text-background/70 mb-6 block"
          >
            Since 1847
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-background mb-6 leading-[1.1] text-balance"
          >
            Our Heritage
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-background/80 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Five generations of Italian craftsmanship, dedicated to the pursuit of timeless elegance.
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
          >
            In the heart of Florence, where the Renaissance redefined beauty and craftsmanship, our story began. What
            started as a modest workshop has evolved into a symbol of Italian excellence, yet our founding principles
            remain unchanged: exceptional materials, masterful technique, and an unwavering commitment to perfection.
          </motion.p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">Our Journey</span>
            <h2 className="font-serif text-3xl lg:text-5xl">A Legacy of Excellence</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line - hidden on mobile */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-12 mb-12 lg:mb-16 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <span className="font-serif text-3xl lg:text-4xl text-muted-foreground/50 block mb-2">
                    {item.year}
                  </span>
                  <h3 className="font-serif text-xl lg:text-2xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{item.description}</p>
                </div>

                {/* Dot - hidden on mobile */}
                <div className="hidden lg:block relative z-10">
                  <div className="w-4 h-4 bg-foreground" />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - converted to Next.js Image with lazy loading */}
      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">Our Philosophy</span>
            <h2 className="font-serif text-3xl lg:text-5xl">Guiding Principles</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="aspect-[5/6] overflow-hidden mb-6 relative">
                  <Image
                    src={value.image || "/placeholder.svg"}
                    alt={value.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-xl lg:text-2xl mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmen Section - converted to Next.js Image with lazy loading */}
      <section className="py-20 lg:py-32 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-background/60 mb-4 block">The Artisans</span>
            <h2 className="font-serif text-3xl lg:text-5xl">Masters of Craft</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {craftsmen.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="aspect-[4/5] overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-700 relative">
                  <Image
                    src={person.image || "/placeholder.svg"}
                    alt={person.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif text-xl lg:text-2xl mb-1">{person.name}</h3>
                <p className="text-background/60 text-sm mb-1">{person.role}</p>
                <p className="text-xs tracking-[0.2em] uppercase text-background/40">{person.years}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-serif text-2xl lg:text-4xl leading-relaxed mb-8 text-balance">
              "True luxury is not about ostentation. It is about the quiet confidence that comes from knowing every
              detail has been considered, every stitch placed with intention."
            </p>
            <cite className="not-italic">
              <span className="block text-sm tracking-[0.2em] uppercase text-muted-foreground">
                — Awais Niaz, Creative Director
              </span>
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">Explore</span>
            <h2 className="font-serif text-3xl lg:text-5xl mb-6">Discover the Collection</h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the culmination of our heritage in every piece we create.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:gap-5 transition-all duration-300"
            >
              View Collection
              <ArrowRight className="h-4 w-4 stroke-[1.5]" />
            </Link>
          </motion.div>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}
