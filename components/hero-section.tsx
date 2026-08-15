"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    image: "/makeup1.jpg",
    alt: "Luxury fashion editorial in dark tones",
    eyebrow: "Autumn / Winter 2026",
    title: ["The Art of", "Quiet Luxury"],
    subtitle: "Timeless pieces crafted with intention. Where heritage meets modern refinement.",
  },
  {
    image: "/makeup2.jpg",
    alt: "Refined luxury garment detail",
    eyebrow: "The New Collection",
    title: ["Handcrafted", "in Florence"],
    subtitle: "Every stitch carries the mastery of our artisans, passed down through generations.",
  },
  {
    image: "/hero3.jpg",
    alt: "Modern luxury fashion model",
    eyebrow: "Seasonal Highlights",
    title: ["Modern", "Refinement"],
    subtitle: "A studied balance of proportion and texture, designed for the discerning wardrobe.",
  },
  {
    image: "/hero4.jpg",
    alt: "Elegant evening wear editorial",
    eyebrow: "The House of SN Collections",
    title: ["Heritage &", "Elegance"],
    subtitle: "One hundred years of excellence, distilled into pieces meant to be treasured.",
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      queueMicrotask(() => setCurrent(emblaApi.selectedScrollSnap()))
    }
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const id = setInterval(() => {
      emblaApi.scrollNext()
    }, 6500)
    return () => clearInterval(id)
  }, [emblaApi])

  return (
    <section className="relative min-h-screen flex">
      {/* Left content - 22% */}
      <div className="hidden lg:flex bg-foreground items-center justify-center w-[22%]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-background -rotate-90 whitespace-nowrap"
        >
          <span className="text-xs tracking-[0.3em] uppercase">SN Collections · Florence</span>
        </motion.div>
      </div>

      {/* Right content - 78% */}
      <div className="flex-1 relative">
        {/* Background carousel */}
        <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div key={slide.image} className="relative h-full w-full shrink-0 grow-0 basis-full">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 78vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-foreground/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-16 pb-24 lg:pb-32">
          {slides.map((slide, index) => {
            const isActive = index === current
            return (
              <div key={slide.image} className={cn("max-w-2xl", isActive ? "block" : "hidden")}>
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                >
                  <span className="mb-6 block text-[11px] tracking-[0.4em] uppercase text-background/70">
                    {slide.eyebrow}
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl text-background leading-[1.1] mb-6 text-balance">
                    {slide.title[0]}
                    <br />
                    {slide.title[1]}
                  </h1>
                  <p className="text-background/80 text-base lg:text-lg tracking-wide mb-10 max-w-md leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/shop">
                      <Button
                        size="lg"
                        className="bg-background text-foreground hover:bg-background/90 px-10 py-6 text-sm tracking-[0.2em] uppercase group"
                      >
                        Discover Collection
                        <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Carousel controls */}
        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex items-center gap-4">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-[2px] transition-all duration-500",
                index === current ? "w-10 bg-background" : "w-6 bg-background/40 hover:bg-background/70"
              )}
            />
          ))}
        </div>

        {/* Arrow controls */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous slide"
          className="absolute right-6 lg:right-10 bottom-8 z-20 grid h-11 w-11 place-items-center rounded-full border border-background/40 text-background transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next slide"
          className="absolute right-16 lg:right-24 bottom-8 z-20 grid h-11 w-11 place-items-center rounded-full border border-background/40 text-background transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}