import type { Metadata } from "next"
import { StaticPage } from "@/components/static-page"

export const metadata: Metadata = {
  title: "Size Guide | SN Collections",
  description: "Find your perfect fit across our luxury collections.",
}

const rows = [
  { label: "XS", chest: "84–89 cm", waist: "68–73 cm", hip: "86–91 cm" },
  { label: "S", chest: "90–95 cm", waist: "74–79 cm", hip: "92–97 cm" },
  { label: "M", chest: "96–101 cm", waist: "80–85 cm", hip: "98–103 cm" },
  { label: "L", chest: "102–107 cm", waist: "86–91 cm", hip: "104–109 cm" },
  { label: "XL", chest: "108–113 cm", waist: "92–97 cm", hip: "110–115 cm" },
]

export default function SizeGuidePage() {
  return (
    <StaticPage
      eyebrow="Find Your Fit"
      title="Size Guide"
      subtitle="Our pieces are cut true to size in European sizing. Compare your measurements to find your perfect fit."
    >
      <p className="text-muted-foreground leading-relaxed mb-10">
        Measure around the fullest part of your chest, the narrowest point of your waist, and the fullest part of your
        hips. If you fall between sizes, we recommend sizing up for a relaxed fit. Shoes are available in EU sizing
        36–44.
      </p>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-6 py-4 font-medium tracking-[0.15em] uppercase text-xs">Size</th>
              <th className="px-6 py-4 font-medium tracking-[0.15em] uppercase text-xs">Chest</th>
              <th className="px-6 py-4 font-medium tracking-[0.15em] uppercase text-xs">Waist</th>
              <th className="px-6 py-4 font-medium tracking-[0.15em] uppercase text-xs">Hip</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-6 py-4 font-serif text-base">{row.label}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.chest}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.waist}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed mt-10">
        Unsure of your fit? Message our concierge on WhatsApp or via the chat widget and we will help you choose the
        right size for any piece.
      </p>
    </StaticPage>
  )
}