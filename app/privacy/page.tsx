import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Privacy Policy | SN Collections",
  description: "How SN Collections collects, uses and protects your personal information.",
}

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly — such as your name, email address, shipping address and payment details — when you place an order, subscribe to our newsletter or contact our concierge.",
  },
  {
    title: "How We Use It",
    body: "We use your information to process and deliver orders, provide customer care, personalise your experience and, with your consent, send you updates about new collections and private events.",
  },
  {
    title: "Payment Security",
    body: "All payments are processed by PCI-DSS compliant providers using bank-level encryption. We never store full card numbers on our servers.",
  },
  {
    title: "Sharing",
    body: "We never sell your personal information. Data is shared only with trusted partners — such as shipping carriers and payment processors — strictly as required to fulfil your orders.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies to keep the site secure and functional. Analytical cookies help us understand how visitors use the store so we can improve it.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time. Contact our privacy team at privacy@sncollections.com and we will respond within 30 days.",
  },
]

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Your Trust"
      title="Privacy Policy"
      subtitle="We take the protection of your personal information seriously. This policy explains what we collect and how we use it."
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