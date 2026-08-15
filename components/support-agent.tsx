"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Send, X, MessageCircle } from "lucide-react"
import { WhatsAppIcon } from "./whatsapp-icon"
import { whatsappUrl } from "@/lib/site-config"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: number
  role: "agent" | "user"
  text: string
  suggestions?: string[]
  time?: string
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const WELCOME: ChatMessage = {
  id: 0,
  role: "agent",
  text: "Welcome to Awais Niaz. I am your personal concierge — here around the clock for our luxury collection, orders, shipping, returns and care.\n\nHow may I assist you today?",
  suggestions: ["What is your shipping policy?", "How do returns work?", "Show me the shoes", "Do you have a size guide?"],
  time: formatTime(new Date()),
}

function ConciergeMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-background", className)}>
      <span className="font-serif leading-none tracking-tight">AN</span>
    </span>
  )
}

function TypingDots() {
  const reduce = useReducedMotion()
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-foreground/70"
          animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export function SupportAgent() {
  const reduce = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping, isOpen])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 380)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  const appendMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: idRef.current++, time: formatTime(new Date()) }])
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    if (/chat on whatsapp/i.test(trimmed)) {
      window.open(whatsappUrl(), "_blank", "noopener,noreferrer")
      return
    }

    setInput("")
    appendMessage({ role: "user", text: trimmed })
    setIsTyping(true)

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!res.ok) throw new Error("Request failed")
      const data = await res.json()
      appendMessage({ role: "agent", text: data.reply, suggestions: data.suggestions })
    } catch {
      appendMessage({
        role: "agent",
        text: "I apologize — I am having trouble reaching my assistant right now. Please tap below to chat with our human concierge on WhatsApp, or try again in a moment.",
        suggestions: ["Chat on WhatsApp"],
      })
    } finally {
      setIsTyping(false)
    }
  }

  const rowTransition = reduce
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.3, ease: EASE }

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close concierge chat" : "Open concierge chat"}
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.3 }}
        whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group fixed bottom-6 left-6 z-50 flex h-14 items-center gap-2.5 rounded-full bg-foreground pl-3 pr-5 text-background shadow-[0_14px_34px_-8px_rgba(0,0,0,0.45)]"
      >
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/10">
          {isOpen ? (
            <X className="relative h-[18px] w-[18px] stroke-[1.6]" />
          ) : (
            <>
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-background/10 motion-safe:animate-ping"
                style={{ animationDuration: "2.6s" }}
              />
              <MessageCircle className="relative h-[18px] w-[18px] stroke-[1.6]" />
            </>
          )}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[13px] font-semibold tracking-wide">{isOpen ? "Close" : "Concierge"}</span>
          <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-background/60">
            <span className={cn("h-1 w-1 rounded-full", isOpen ? "bg-background/40" : "bg-emerald-400")} />
            {isOpen ? "Chat open" : "Online · instant"}
          </span>
        </span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "tween", duration: 0.32, ease: EASE }}
            className="fixed bottom-24 left-4 z-50 flex h-[min(74vh,600px)] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden border border-black/10 bg-white shadow-[0_28px_70px_-16px_rgba(0,0,0,0.35)] sm:left-6"
          >
            {/* Header */}
            <div className="bg-foreground px-5 pb-4 pt-5 text-background">
              <div className="flex items-center gap-3">
                <ConciergeMark className="h-10 w-10 text-[13px] ring-2 ring-background/15" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate font-serif text-[16px] leading-none tracking-wide">Awais Niaz</p>
                    <span className="hidden text-[9px] uppercase tracking-[0.24em] text-background/60 sm:inline">
                      Concierge
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-background/60">
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        aria-hidden
                        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping"
                        style={{ animationDuration: "2.2s" }}
                      />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Online · replies instantly
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="-mr-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-background/70 transition-colors hover:bg-background/10 hover:text-background"
                >
                  <X className="h-[18px] w-[18px] stroke-[1.6]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[#F5F4F1] px-4 py-5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={rowTransition}
                  className={cn("flex items-end gap-2.5", m.role === "user" && "justify-end")}
                >
                  {m.role === "agent" && <ConciergeMark className="h-7 w-7 text-[10px]" />}
                  <div className={cn("max-w-[82%]", m.role === "user" && "flex flex-col items-end")}>
                    <div
                      className={cn(
                        "rounded-[3px] px-4 py-3 text-[13.5px] leading-relaxed",
                        m.role === "user"
                          ? "bg-foreground text-background"
                          : "border border-black/[0.06] bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <span
                      className={cn(
                        "mt-1 block text-[10px] tracking-wide text-neutral-500",
                        m.role === "user" && "mr-1"
                      )}
                    >
                      {m.time}
                    </span>
                    {m.role === "agent" && m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {m.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="rounded-full border border-foreground/15 bg-white px-3.5 py-2 text-xs text-foreground transition-colors duration-200 hover:border-foreground hover:bg-foreground hover:text-background"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={rowTransition}
                  className="flex items-end gap-2.5"
                >
                  <ConciergeMark className="h-7 w-7 text-[10px]" />
                  <div className="rounded-[3px] border border-black/[0.06] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Escalation */}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 border-t border-black/[0.06] bg-white py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition-colors duration-200 hover:text-foreground"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#1FAF5A] transition-transform duration-200 group-hover:scale-110" />
              Chat with a human concierge
            </a>

            {/* Input */}
            <div className="flex items-center gap-2.5 border-t border-black/[0.06] bg-white px-4 py-3.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input)
                }}
                placeholder="Type your message…"
                aria-label="Message"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-neutral-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-all duration-200 hover:bg-foreground/85 disabled:opacity-25 disabled:hover:bg-foreground"
              >
                <Send className="h-4 w-4 -translate-x-px" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}