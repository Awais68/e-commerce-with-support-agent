"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MapPin, Phone, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { whatsappUrl } from "@/lib/site-config"

const contactInfo = [
  {
    icon: MapPin,
    title: "Boutique",
    lines: ["Via della Condotta 12", "50122 Florence, Italy"],
  },
  {
    icon: Phone,
    title: "Concierge",
    lines: ["+39 055 1234 567", "+1 (212) 555 0187"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["concierge@sncollections.com", "press@sncollections.com"],
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon – Sat: 9:00 – 20:00", "Sun: 11:00 – 18:00"],
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Enquiry", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen">
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
            We Are At Your Service
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-background mb-6 leading-[1.1]"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-background/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Our concierge is available to assist with your orders, collections, and everything in between.
          </motion.p>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20 lg:mb-28">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border border-border p-8"
              >
                <item.icon className="h-6 w-6 stroke-[1.5] mb-6" />
                <h3 className="font-serif text-lg mb-3">{item.title}</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {item.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4 block">Send a Message</span>
              <h2 className="font-serif text-3xl lg:text-4xl mb-8">Write to Us</h2>

              {submitted ? (
                <div className="border border-border bg-muted p-10 text-center">
                  <h3 className="font-serif text-2xl mb-4">Thank You</h3>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    Your message has been received. Our concierge will respond within one business day.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({ name: "", email: "", subject: "General Enquiry", message: "" })
                    }}
                    className="bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full border-0 border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full border-0 border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border-0 border-b border-border bg-background py-3 text-sm outline-none focus:border-foreground transition-colors"
                    >
                      <option>General Enquiry</option>
                      <option>Order Support</option>
                      <option>Shipping & Delivery</option>
                      <option>Returns & Exchanges</option>
                      <option>Product Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How may we assist you?"
                      className="w-full border-0 border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:opacity-85 transition-opacity"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>

            {/* Direct contact */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-foreground text-background p-10 lg:p-14"
            >
              <span className="text-xs tracking-[0.4em] uppercase text-background/50 mb-4 block">Prefer Instant Help?</span>
              <h2 className="font-serif text-3xl lg:text-4xl mb-6">Chat With Us</h2>
              <p className="text-background/70 leading-relaxed mb-10">
                Our concierge responds in minutes — day or night. Reach us directly on WhatsApp for the fastest
                assistance with your orders, sizing, and returns.
              </p>

              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-[#25D366] px-8 py-4 text-sm tracking-[0.2em] uppercase text-white hover:brightness-95 transition-all"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Chat on WhatsApp
              </a>

              <div className="mt-12 pt-10 border-t border-background/15 space-y-4">
                <p className="text-sm text-background/60">
                  <span className="text-background/40 uppercase tracking-[0.2em] text-xs block mb-1">
                    Response Times
                  </span>
                  WhatsApp: within minutes · Email: within 1 business day
                </p>
                <p className="text-sm text-background/60">
                  <span className="text-background/40 uppercase tracking-[0.2em] text-xs block mb-1">
                    Atelier Appointments
                  </span>
                  Private consultations available by request in Florence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}