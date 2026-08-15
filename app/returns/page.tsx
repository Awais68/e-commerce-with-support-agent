"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Check, RotateCcw, RefreshCcw, ShieldCheck } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"

const policySections = [
  {
    title: "Our Promise",
    body: "Every SN Collections piece is crafted with care and inspected before dispatch. If you are not entirely satisfied, we offer a straightforward returns policy so you can shop with complete confidence.",
  },
  {
    title: "Return Window",
    body: "You have 30 days from the date of delivery to return an item. If the return window has passed, please contact our concierge — exceptional cases are reviewed individually.",
  },
  {
    title: "Condition of Items",
    body: "Items must be returned unworn, unwashed, and in their original condition with all tags attached and in their original packaging. We ask that you try items on over clean clothing, as is standard for luxury goods.",
  },
  {
    title: "How to Start a Return",
    body: "Contact our concierge via the contact form, WhatsApp, or email with your order number. We will provide a prepaid return label and a unique returns reference, then guide you through the rest of the process.",
  },
  {
    title: "Refunds & Timeframes",
    body: "Once your return arrives at our atelier and passes inspection, we will process your refund within 5–7 business days. Refunds are issued to the original payment method and typically appear within 3–5 business days after processing.",
  },
  {
    title: "Exchanges",
    body: "Prefer a different size or colour? Simply let us know when you initiate your return and we will prioritise your exchange, holding the replacement while your original item is on its way back.",
  },
  {
    title: "Non-Returnable Items",
    body: "For hygiene reasons, personal accessories in sealed packaging — such as earrings, fragrance, and intimates — may only be returned if unopened and sealed. Custom and made-to-order pieces are final sale unless faulty.",
  },
  {
    title: "Damaged or Incorrect Items",
    body: "If your order arrives damaged or incorrect, please notify our concierge within 48 hours of delivery with photographs. We will arrange a replacement or refund at no cost to you.",
  },
]

const steps = [
  { title: "Request", description: "Message our concierge with your order number" },
  { title: "Receive", description: "We email a prepaid return label within hours" },
  { title: "Dispatch", description: "Send the item back in its original packaging" },
  { title: "Refund", description: "We refund within 5–7 business days of inspection" },
]

export default function ReturnsPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground to-foreground/95" />
        <div className="relative z-10 text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.4em] uppercase text-background/60 mb-6 block"
          >
            Shop With Confidence
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-background mb-6 leading-[1.1]"
          >
            Return Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-background/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Effortless returns within 30 days — because luxury should be as easy as it is beautiful.
          </motion.p>
        </div>
      </section>

      {/* Policy sections */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">The Details</span>
            <h2 className="font-serif text-3xl lg:text-5xl">Our Returns Policy</h2>
          </motion.div>

          <div className="space-y-12">
            {policySections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                className="border-l border-border pl-6 lg:pl-10"
              >
                <h3 className="font-serif text-xl lg:text-2xl mb-3">{section.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{section.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">Simple Process</span>
            <h2 className="font-serif text-3xl lg:text-5xl">Returns in Four Steps</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background border border-border p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-4xl text-muted-foreground/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Check className="h-5 w-5 stroke-[1.5] text-muted-foreground/60" />
                </div>
                <h3 className="font-serif text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Assurance */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {[
              {
                icon: RotateCcw,
                title: "30-Day Returns",
                description: "A full refund on any eligible item within 30 days of delivery.",
              },
              {
                icon: ShieldCheck,
                title: "Prepaid Labels",
                description: "We cover the return shipping with a prepaid, tracked label.",
              },
              {
                icon: RefreshCcw,
                title: "Easy Exchanges",
                description: "Swapping sizes or colours is effortless — just ask our concierge.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <item.icon className="h-8 w-8 stroke-[1.5] mx-auto mb-6" />
                <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20 lg:mt-28"
          >
            <p className="text-muted-foreground text-lg mb-8">Questions about a return? We are here to help.</p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:gap-5 transition-all duration-300"
            >
              Contact Our Concierge
              <ArrowRight className="h-4 w-4 stroke-[1.5]" />
            </Link>
          </motion.div>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}