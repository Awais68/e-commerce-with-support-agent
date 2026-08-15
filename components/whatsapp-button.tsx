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
      className="group fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2.5 rounded-full bg-[#1FAF5A] pl-3 pr-5 text-white shadow-[0_14px_34px_-8px_rgba(31,175,90,0.55)] transition-colors duration-300 hover:bg-[#25D366]"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
        <span
          aria-hidden
          className="absolute inset-0 motion-safe:animate-ping rounded-full bg-white/20"
          style={{ animationDuration: "2.6s" }}
        />
        <WhatsAppIcon className="relative h-[18px] w-[18px]" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[13px] font-semibold tracking-wide">WhatsApp</span>
        <span className="text-[10px] tracking-wide text-white/90">Replies in minutes</span>
      </span>
    </motion.a>
  )
}