"use client"

import { motion, useReducedMotion } from "framer-motion"
import { WhatsAppIcon } from "./whatsapp-icon"
import { whatsappUrl } from "@/lib/site-config"

export function WhatsAppButton() {
  const reduce = useReducedMotion()
  const href = whatsappUrl()

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.45 }}
      whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group fixed bottom-6 left-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-[#16A34A] to-[#25D366] text-white shadow-[0_14px_34px_-8px_rgba(31,175,90,0.55)] ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-[0_18px_40px_-10px_rgba(37,211,102,0.65)]"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="absolute right-0 top-0 flex h-3 w-3" aria-hidden>
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 motion-safe:animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-white" />
      </span>
    </motion.a>
  )
}