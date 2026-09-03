import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Shipping | SN Collections",
  description: "Complimentary, tracked worldwide delivery from our Florence atelier.",
}

const sections = [
  {
    title: "Standard Delivery",
    body: "Orders are dispatched from Florence within 24–48 hours and arrive in 3–5 business days. Shipping is complimentary on all orders over Rs. 150 and fully tracked to your door.",
  },
  {
    title: "Express Delivery",
    body: "For urgent deliveries, express shipping arrives in 1–2 business days. Orders placed before 12pm CET are prioritised for same-day dispatch.",
  },
  {
    title: "International Orders",
    body: "We deliver worldwide, including the USA, UK, Europe, the Gulf and Pakistan. International orders travel via insured express courier with full tracking, and import duties are shown at checkout for most destinations.",
  },
  {
    title: "Signature Required",
    body: "Orders over Rs. 200 require a signature on delivery. You can request a safe-place drop or reschedule delivery via your courier tracking once your order ships.",
  },
]

export default function ShippingPage() {
  return (
    <StaticPage
      eyebrow="Worldwide Delivery"
      title="Shipping"
      subtitle="Complimentary, tracked delivery from our Florence atelier to anywhere in the world."
    >
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="border-l border-border pl-6 lg:pl-10">
            <h2 className="font-serif text-xl lg:text-2xl mb-3">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}