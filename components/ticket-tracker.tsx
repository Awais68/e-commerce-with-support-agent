"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TicketMessage {
  id?: string | number
  author?: string
  author_type?: string
  role?: string
  body?: string
  message?: string
  content?: string
  created_at?: string
  createdAt?: string
}

export interface Ticket {
  ticketNumber: string
  subject?: string
  status?: string
  priority?: string
  category?: string
  createdAt?: string | null
  updatedAt?: string | null
  messages?: TicketMessage[]
  [key: string]: unknown
}

const STATUS_TONE: Record<string, string> = {
  open: "bg-foreground text-background",
  new: "bg-foreground text-background",
  pending: "bg-amber-100 text-amber-900 border border-amber-200",
  in_progress: "bg-amber-100 text-amber-900 border border-amber-200",
  waiting_customer: "bg-amber-100 text-amber-900 border border-amber-200",
  resolved: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  closed: "bg-muted text-muted-foreground border border-border",
}

function formatStamp(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
}

function messageBody(message: TicketMessage): string {
  return message.body ?? message.message ?? message.content ?? ""
}

function isAgentMessage(message: TicketMessage): boolean {
  const role = (message.author_type ?? message.role ?? "").toLowerCase()
  return role.includes("agent") || role.includes("staff") || role.includes("assistant") || role.includes("support")
}

export function TicketTracker({ ticketNumber }: { ticketNumber: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const load = () => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    // no-store on both hops: a customer refreshing this page wants the reply
    // an agent posted a second ago, not a cached copy of the old thread.
    fetch(`/api/support/${encodeURIComponent(ticketNumber)}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || "We could not load this ticket.")
        return data
      })
      .then((data) => {
        if (cancelled) return
        setTicket(data.ticket)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) return
        setError(err instanceof Error ? err.message : "Something went wrong.")
        setTicket(null)
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [ticketNumber, reloadKey])

  if (loading && !ticket) {
    return (
      <div className="flex items-center gap-3 border border-border p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Fetching your ticket…
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-border p-10">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <h3 className="font-serif text-xl mb-2">We could not open that ticket</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) return null

  const status = (ticket.status ?? "open").toLowerCase()
  const messages = Array.isArray(ticket.messages) ? ticket.messages : []

  return (
    <div className="space-y-10">
      <div className="border border-border p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground block mb-3">Ticket</span>
            <p className="font-mono text-lg tracking-wide">{ticket.ticketNumber}</p>
            {ticket.subject && <h1 className="font-serif text-2xl lg:text-3xl mt-3">{ticket.subject}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-4 py-2 text-[10px] tracking-[0.2em] uppercase",
                STATUS_TONE[status] ?? "bg-muted text-muted-foreground border border-border"
              )}
            >
              {status.replace(/_/g, " ")}
            </span>
            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh ticket"
              className="grid h-9 w-9 place-items-center border border-border hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {[
            { label: "Category", value: ticket.category?.replace(/_/g, " ") },
            { label: "Priority", value: ticket.priority },
            { label: "Opened", value: formatStamp(ticket.createdAt) },
            { label: "Last Update", value: formatStamp(ticket.updatedAt) },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{item.label}</dt>
              <dd className="text-sm capitalize">{item.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="font-serif text-xl lg:text-2xl mb-6">Conversation</h2>
        {messages.length === 0 ? (
          <p className="border border-border p-8 text-sm text-muted-foreground leading-relaxed">
            No replies yet. Our concierge responds within one business day — refresh this page for the latest.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const fromAgent = isAgentMessage(message)
              return (
                <motion.div
                  key={message.id ?? index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                  className={cn(
                    "border p-6",
                    fromAgent ? "border-border bg-muted" : "border-border bg-background"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      {fromAgent ? message.author || "SN Concierge" : message.author || "You"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {formatStamp(message.created_at ?? message.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{messageBody(message)}</p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
