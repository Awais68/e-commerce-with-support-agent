import type { Metadata } from "next"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { SupportCenter } from "@/components/support-center"

export const metadata: Metadata = {
  title: "Customer Agent | SN Collections",
  description: "Chat with our AI concierge, open a support ticket, or track a ticket you already have.",
}

export default function SupportPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-32 lg:pt-40 pb-12 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-5 block">
            We Are At Your Service
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6">Customer Agent</h1>
          <p className="text-muted-foreground text-base lg:text-lg max-w-2xl leading-relaxed">
            Answers in seconds from our AI concierge, and a human on the other end whenever you need one. Every ticket
            gets a number you can follow right here.
          </p>
        </div>
      </section>

      <section className="pb-24 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<div className="border border-border p-10 text-sm text-muted-foreground">Loading…</div>}>
            <SupportCenter />
          </Suspense>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}
