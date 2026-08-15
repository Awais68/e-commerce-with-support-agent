import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Sustainability | SN Collections",
  description: "Our commitment to responsible, ethical luxury at every stage of creation.",
}

const pillars = [
  {
    title: "Ethical Sourcing",
    body: "We work directly with certified farms and tanneries that share our standards. Our cashmere, wool and leather are traceable to origin, and every supplier is audited for animal welfare, fair labour and environmental practice.",
  },
  {
    title: "Made to Last",
    body: "True sustainability is durability. Our pieces are constructed to be worn and repaired for decades, not seasons. We offer a lifetime repair service on leather goods and footwear, keeping treasured pieces in circulation rather than landfill.",
  },
  {
    title: "Conscious Production",
    body: "Our ateliers run on renewable energy and we minimise water and chemical use through traditional techniques. Offcuts are upcycled into accessories, and packaging is plastic-free, recyclable and beautiful.",
  },
  {
    title: "Giving Back",
    body: "A portion of every sale supports artisan apprenticeships in Florence and Como, ensuring the next generation of craftspeople can carry these skills forward.",
  },
]

export default function SustainabilityPage() {
  return (
    <StaticPage
      eyebrow="Responsible Luxury"
      title="Sustainability"
      subtitle="We believe true luxury must be responsible to both people and planet — at every stage of creation."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="border-l border-border pl-6 lg:pl-8">
            <h2 className="font-serif text-xl lg:text-2xl mb-3">{pillar.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{pillar.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}