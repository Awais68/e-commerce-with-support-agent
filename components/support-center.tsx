"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bot, LifeBuoy, Search, Send, Ticket as TicketIcon } from "lucide-react"
import { TicketForm } from "@/components/ticket-form"
import { useAuth } from "@/lib/use-auth"
import { ticketTrackingPath } from "@/lib/support-tickets"
import { cn } from "@/lib/utils"

type TabKey = "agent" | "ticket" | "track"

const TABS: { key: TabKey; label: string; icon: typeof Bot; blurb: string }[] = [
  { key: "agent", label: "Ask the Agent", icon: Bot, blurb: "Instant answers from live order, stock and payment data." },
  { key: "ticket", label: "Open a Ticket", icon: TicketIcon, blurb: "Anything the agent can't settle goes to a human concierge." },
  { key: "track", label: "Track a Ticket", icon: Search, blurb: "Check the status and replies on a ticket you already opened." },
]

interface ChatProduct {
  id: string
  name: string
  price: number
  category: string
  image: string
}

interface ChatMessage {
  id: number
  role: "agent" | "user"
  text: string
  suggestions?: string[]
  products?: ChatProduct[]
}

const WELCOME: ChatMessage = {
  id: 0,
  role: "agent",
  text: "Welcome to SN Collections. I am your AI concierge — trained on our live orders, payments, inventory and dispatch data.\n\nAsk me anything, or open a ticket if you would rather a person handled it.",
  suggestions: ["Where is my order?", "Do you offer Cash on Delivery?", "How do returns work?", "What stock is available?"],
}

function isValidTab(value: string | null): value is TabKey {
  return value === "agent" || value === "ticket" || value === "track"
}

export function SupportCenter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reduce = useReducedMotion()
  const { user } = useAuth()

  const tabParam = searchParams.get("tab")
  const [tab, setTab] = useState<TabKey>(isValidTab(tabParam) ? tabParam : "agent")

  const selectTab = (key: TabKey) => {
    setTab(key)
    router.replace(`/support?tab=${key}`, { scroll: false })
  }

  return (
    <div className="space-y-12">
      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-border">
        {TABS.map((item) => {
          const active = tab === item.key
          return (
            <button
              key={item.key}
              onClick={() => selectTab(item.key)}
              aria-pressed={active}
              className={cn(
                "group relative px-6 py-7 text-left transition-colors border-border sm:border-l first:sm:border-l-0 border-t sm:border-t-0 first:border-t-0",
                active ? "bg-foreground text-background" : "hover:bg-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5 stroke-[1.5] mb-4", active ? "text-background" : "text-foreground")} />
              <span className="block text-xs tracking-[0.2em] uppercase mb-2">{item.label}</span>
              <span className={cn("block text-xs leading-relaxed", active ? "text-background/60" : "text-muted-foreground")}>
                {item.blurb}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {tab === "agent" && <AgentChat />}
          {tab === "ticket" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
              <TicketForm />
              <aside className="border border-border p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-foreground block mb-3">Response Times</span>
                  Tickets are answered within one business day. Urgent order issues are picked up the same day.
                </div>
                <div className="border-t border-border pt-6">
                  <span className="text-xs tracking-[0.2em] uppercase text-foreground block mb-3">Signed In?</span>
                  {user
                    ? `We're using ${user.email} from your account, so the concierge sees your full order history.`
                    : "Sign in before opening a ticket and the concierge will see your past orders automatically."}
                  {!user && (
                    <Link href="/account/login" className="mt-3 block text-foreground underline underline-offset-4">
                      Sign in
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          )}
          {tab === "track" && <TrackTicket />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TrackTicket() {
  const router = useRouter()
  const [value, setValue] = useState("")

  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-2xl lg:text-3xl mb-4">Find Your Ticket</h2>
      <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
        Enter the ticket number from your confirmation — it was shown the moment you opened the ticket and emailed to
        you as well.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = value.trim()
          if (trimmed) router.push(ticketTrackingPath(trimmed))
        }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="TKT-XXXXXX"
          aria-label="Ticket number"
          className="flex-1 border-0 border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:opacity-85 transition-opacity disabled:opacity-40"
        >
          Track
        </button>
      </form>

      <div className="mt-12 border-t border-border pt-8 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Looking for a parcel rather than a ticket? Order tracking lives at{" "}
          <Link href="/track" className="text-foreground underline underline-offset-4">
            /track
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function AgentChat() {
  const reduce = useReducedMotion()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    setInput("")
    setMessages((prev) => [...prev, { id: idRef.current++, role: "user", text: trimmed }])
    setIsTyping(true)

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!res.ok) throw new Error("Request failed")
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { id: idRef.current++, role: "agent", text: data.reply, suggestions: data.suggestions, products: data.products },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          role: "agent",
          text: "I am having trouble reaching my assistant right now. Open a ticket and a human concierge will pick it up.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="border border-border">
      <div ref={scrollRef} data-lenis-prevent className="h-[min(60vh,520px)] overflow-y-auto overscroll-contain bg-muted/40 px-5 py-6 space-y-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={cn("flex items-end gap-3", m.role === "user" && "justify-end")}
          >
            {m.role === "agent" && (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background">
                <Bot className="h-4 w-4 stroke-[1.6]" />
              </span>
            )}
            <div className={cn("max-w-[78%]", m.role === "user" && "flex flex-col items-end")}>
              <div
                className={cn(
                  "px-5 py-3.5 text-sm leading-relaxed",
                  m.role === "user" ? "bg-foreground text-background" : "border border-border bg-background"
                )}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>

              {m.products && m.products.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                  {m.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="flex gap-4 border border-border bg-background p-3 hover:border-foreground transition-colors"
                    >
                      <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted">
                        <Image src={p.image || "/placeholder.svg"} alt={p.name} fill sizes="64px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1 py-0.5">
                        <span className="block truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.category}
                        </span>
                        <span className="block truncate font-serif text-sm">{p.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">Rs. {p.price.toLocaleString()}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border border-border bg-background px-4 py-2 text-xs transition-colors hover:bg-foreground hover:text-background"
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
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background">
              <Bot className="h-4 w-4 stroke-[1.6]" />
            </span>
            <div className="flex items-center gap-1 border border-border bg-background px-5 py-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                  animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-background px-5 py-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input)
          }}
          placeholder="Ask about an order, delivery, sizing or payment…"
          aria-label="Message the agent"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center bg-foreground text-background transition-opacity hover:opacity-85 disabled:opacity-25"
        >
          <Send className="h-4 w-4 -translate-x-px" />
        </button>
      </div>
    </div>
  )
}
