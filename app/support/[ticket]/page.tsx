import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { TicketTracker } from "@/components/ticket-tracker"

// Ticket state is live; nothing on this page may be prerendered or cached.
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Track Your Ticket | SN Collections",
  description: "Follow your support ticket and read our concierge's replies.",
}

export default async function TicketPage({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params
  const ticketNumber = decodeURIComponent(ticket)

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Customer Agent
          </Link>

          <TicketTracker ticketNumber={ticketNumber} />
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}
