import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Terms of Service | SN Collections",
  description: "The terms and conditions governing the use of the SN Collections store.",
}

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or purchasing from this website you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please do not use the store.",
  },
  {
    title: "Products & Pricing",
    body: "We strive to display accurate product descriptions and pricing. Prices are shown in euros and may change without notice. We reserve the right to refuse or cancel any order where an error has occurred in pricing or availability.",
  },
  {
    title: "Orders",
    body: "Placing an order constitutes an offer to purchase. Orders are accepted when we dispatch confirmation to you. We may request additional verification before processing high-value orders.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this site — including designs, images, text and the SN Collections name — is the property of SN Collections and may not be reproduced without prior written consent.",
  },
  {
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, SN Collections shall not be liable for any indirect or consequential loss arising from the use of this website or the purchase of our products.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of Italy. Any disputes shall be subject to the exclusive jurisdiction of the courts of Florence.",
  },
]

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Good to Know"
      title="Terms of Service"
      subtitle="The terms that govern your use of the SN Collections store and services."
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