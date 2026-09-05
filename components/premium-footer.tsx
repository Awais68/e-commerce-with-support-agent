"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Instagram, Facebook, Linkedin } from "lucide-react"
import { FooterCanvas } from "./footer-canvas"

const socialLinks = [
  { href: "https://www.instagram.com/awaisshaikh0002/", label: "Instagram", Icon: Instagram },
  { href: "https://www.facebook.com/awais.shaikh.662440/", label: "Facebook", Icon: Facebook },
  { href: "https://www.linkedin.com/in/awaisniaz-dev/", label: "LinkedIn", Icon: Linkedin },
]

export function PremiumFooter() {
  const footerLinks = {
    shop: [
      { label: "New Arrivals", href: "/shop" },
      { label: "Women", href: "/shop?category=Women" },
      { label: "Men", href: "/shop?category=Men" },
      { label: "Accessories", href: "/shop?category=Accessories" },
      { label: "Timepieces", href: "/shop?category=Shoes" },
    ],
    about: [
      { label: "Our Heritage", href: "/heritage" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
    support: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order", href: "/track" },
      { label: "Return Policy", href: "/returns" },
      { label: "Shipping", href: "/shipping" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Care Instructions", href: "/care" },
    ],
  }

  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <FooterCanvas />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <h3 className="font-serif text-xl mb-4">Stay Connected</h3>
            <p className="text-background/60 text-sm mb-6 leading-relaxed">
              Subscribe for exclusive access to new collections and private events.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent border-0 border-b border-background/30 py-3 text-sm placeholder:text-background/40 focus:outline-none focus:border-background transition-colors"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-xs tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
                Subscribe
              </button>
            </div>
          </motion.div>

          {/* Shop links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/60">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-background/80 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* About links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/60">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/80 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/60">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/80 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-lg tracking-[0.3em] uppercase">
              SN Collections
            </Link>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 stroke-[1.5]" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-background/50">
            <Link href="/privacy" className="hover:text-background/80 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-background/80 transition-colors">
              Terms of Service
            </Link>
            <span>© 2026 SN Collections. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}