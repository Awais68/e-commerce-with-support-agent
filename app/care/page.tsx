import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Care Instructions | SN Collections",
  description: "How to care for your SN Collections pieces so they last a lifetime.",
}

const items = [
  {
    title: "Silk & Evening Wear",
    body: "Dry clean only. Store on a padded hanger, away from direct sunlight. Avoid contact with perfume and deodorant before dressing.",
  },
  {
    title: "Cashmere & Merino",
    body: "Hand wash cold with a gentle wool wash, or dry clean. Lay flat to dry on a towel — never hang. Store folded with cedar or lavender to deter moths.",
  },
  {
    title: "Leather Goods",
    body: "Condition with a neutral leather balm every two to three months. Store in the provided dust bag, away from heat and moisture. If wet, pat dry and air dry naturally.",
  },
  {
    title: "Shoes & Footwear",
    body: "Polish with a neutral cream and use cedar shoe trees between wears to preserve shape. Resole when the sole begins to wear — we offer a lifetime repair service.",
  },
  {
    title: "Linen & Cotton",
    body: "Machine wash cold and hang or tumble dry low. Iron while slightly damp for a crisp finish. These fabrics soften beautifully with wear.",
  },
]

export default function CarePage() {
  return (
    <StaticPage
      eyebrow="Made to Last"
      title="Care Instructions"
      subtitle="A few simple rituals keep your pieces beautiful for decades. When in doubt, every product page lists specific care guidance."
    >
      <div className="space-y-12">
        {items.map((item) => (
          <div key={item.title} className="border-l border-border pl-6 lg:pl-10">
            <h2 className="font-serif text-xl lg:text-2xl mb-3">{item.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{item.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}