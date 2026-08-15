import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Careers | SN Collections",
  description: "Join the SN Collections house — a career in craftsmanship and luxury retail.",
}

const roles = [
  {
    title: "Atelier Apprentice — Leather Goods",
    location: "Florence, Italy",
    description:
      "A full-time, paid apprenticeship with our master leather artisans. Learn cutting, hand-stitching and edge finishing over a structured two-year programme.",
  },
  {
    title: "Client Relations Advisor",
    location: "Florence, Italy",
    description:
      "The voice of our house for clients worldwide — supporting personal shopping, appointments and aftercare through our concierge channels.",
  },
  {
    title: "Knitwear Technician",
    location: "Como, Italy",
    description:
      "Experienced in fully-fashioned knitwear production to oversee quality across our cashmere and merino collections.",
  },
]

export default function CareersPage() {
  return (
    <StaticPage
      eyebrow="Join the House"
      title="Careers"
      subtitle="We are always seeking exceptional craftspeople and warm, discreet professionals to join the SN Collections family."
    >
      <div className="space-y-8">
        {roles.map((role) => (
          <div key={role.title} className="border border-border p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <h2 className="font-serif text-xl lg:text-2xl">{role.title}</h2>
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap">
                {role.location}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base mb-6">{role.description}</p>
            <a
              href="mailto:careers@sncollections.com"
              className="inline-block bg-foreground text-background px-6 py-3 text-xs tracking-[0.2em] uppercase hover:opacity-85 transition-opacity"
            >
              Apply Now
            </a>
          </div>
        ))}
      </div>
    </StaticPage>
  )
}