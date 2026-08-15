import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Craftsmanship | SN Collections",
  description: "Discover the master artisans and time-honoured techniques behind every SN Collections piece.",
}

const sections = [
  {
    title: "Hand-Finishing",
    body: "Every SN Collections piece passes through the hands of a master artisan before it leaves our atelier. Lapels are pressed, edges are burnished, and each stitch is placed by hand — no shortcuts, no compromise. This is why a single garment can require more than thirty hours of work.",
  },
  {
    title: "Materials of Distinction",
    body: "We source only the finest raw materials: Grade-A Mongolian cashmere, mulberry silk, Super 150s wool and vegetable-tanned Tuscan leather. Each hide and every bolt of fabric is inspected and selected for consistency of grain, colour and texture before a single cut is made.",
  },
  {
    title: "Techniques Preserved",
    body: "Our artisans employ techniques refined over generations — from Goodyear-welted shoemaking to fully-fashioned knitwear and hand-rolled silk hems. Many of these methods are taught atelier-to-atelier and cannot be replicated by machine, preserving a living heritage of craft.",
  },
  {
    title: "Numbered Authenticity",
    body: "Each piece carries a numbered authenticity tag recording the artisan, the atelier and the year of creation. It is our signature of provenance — a quiet promise of the hands and care behind everything you wear.",
  },
]

export default function CraftsmanshipPage() {
  return (
    <StaticPage
      eyebrow="The House of SN Collections"
      title="Craftsmanship"
      subtitle="The quiet mastery behind every piece, perfected over five generations in Florence and Como."
    >
      <div className="space-y-14">
        {sections.map((section, index) => (
          <div key={section.title} className={index % 2 === 1 ? "lg:text-right" : ""}>
            <h2 className="font-serif text-2xl lg:text-3xl mb-4">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}