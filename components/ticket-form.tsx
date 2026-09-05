"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2, Lock } from "lucide-react"
import { useAuth } from "@/lib/use-auth"
import { TICKET_CATEGORIES, TICKET_PRIORITIES, type TicketCategory, type TicketPriority } from "@/lib/support-tickets"
import { cn } from "@/lib/utils"

export interface TicketResult {
  ticketNumber: string
  trackingPath: string
  status: string
}

interface TicketFormProps {
  /** Pre-selected category, e.g. an order page opening the form for a delivery issue. */
  defaultCategory?: TicketCategory
  defaultOrderReference?: string
  onCreated?: (result: TicketResult) => void
  className?: string
}

const inputClass =
  "w-full border-0 border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
const labelClass = "block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3"

export function TicketForm({ defaultCategory = "general", defaultOrderReference = "", onCreated, className }: TicketFormProps) {
  const { user, status: authStatus } = useAuth()
  const [form, setForm] = useState({
    subject: "",
    category: defaultCategory as TicketCategory,
    priority: "normal" as TicketPriority,
    orderReference: defaultOrderReference,
    message: "",
  })
  // Name and email are derived from the session and only overridden once the
  // customer types — no effect, so a late-arriving session never clobbers input.
  const [nameOverride, setNameOverride] = useState<string | null>(null)
  const [emailOverride, setEmailOverride] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // The support backend can be on a sleeping free tier that cold-starts in ~30s.
  // Without this the customer stares at a spinner and assumes the form is broken.
  const [wakingBackend, setWakingBackend] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TicketResult | null>(null)

  const sessionName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() : ""
  const name = nameOverride ?? sessionName
  // Identity resolution on the agent side keys on email, so a signed-in
  // customer always submits the address we already have on file.
  const emailLocked = Boolean(user)
  const email = user?.email ?? emailOverride ?? ""

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const slowTimer = setTimeout(() => setWakingBackend(true), 8_000)

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: form.subject || TICKET_CATEGORIES.find((c) => c.value === form.category)?.label,
          category: form.category,
          priority: form.priority,
          message: form.message,
          orderReference: form.orderReference,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "We could not open your ticket. Please try again.")

      const created: TicketResult = {
        ticketNumber: data.ticketNumber,
        trackingPath: data.trackingPath,
        status: data.status ?? "open",
      }
      setResult(created)
      onCreated?.(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      clearTimeout(slowTimer)
      setWakingBackend(false)
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className={cn("border border-border bg-muted p-10", className)}>
        <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Ticket Opened</span>
        <h3 className="font-serif text-2xl mb-4">We have your enquiry</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Your ticket number is{" "}
          <span className="font-mono text-foreground tracking-wide">{result.ticketNumber}</span>. Keep it — you can
          check the reply at any time, and our concierge responds within one business day.
        </p>
        <Link
          href={result.trackingPath}
          className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:opacity-85 transition-opacity"
        >
          Track This Ticket
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setForm((prev) => ({ ...prev, subject: "", message: "", orderReference: "" }))
          }}
          className="mt-6 block text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          Open Another Ticket
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} htmlFor="ticket-name">Name</label>
          <input
            id="ticket-name"
            type="text"
            required
            value={name}
            onChange={(e) => setNameOverride(e.target.value)}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ticket-email">
            Email
            {emailLocked && (
              <span className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal text-[10px] text-muted-foreground/70">
                <Lock className="h-3 w-3" /> from your account
              </span>
            )}
          </label>
          <input
            id="ticket-email"
            type="email"
            required
            readOnly={emailLocked}
            value={email}
            onChange={(e) => setEmailOverride(e.target.value)}
            placeholder={authStatus === "loading" ? "Loading…" : "you@example.com"}
            className={cn(inputClass, emailLocked && "text-muted-foreground cursor-not-allowed")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} htmlFor="ticket-category">Category</label>
          <select
            id="ticket-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
            className={cn(inputClass, "bg-background")}
          >
            {TICKET_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ticket-priority">Priority</label>
          <select
            id="ticket-priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
            className={cn(inputClass, "bg-background")}
          >
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} htmlFor="ticket-subject">Subject</label>
          <input
            id="ticket-subject"
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="A short summary"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ticket-order">Order Number (optional)</label>
          <input
            id="ticket-order"
            type="text"
            value={form.orderReference}
            onChange={(e) => setForm({ ...form, orderReference: e.target.value })}
            placeholder="SN-XXXXXXX"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="ticket-message">Message</label>
        <textarea
          id="ticket-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="How may we assist you?"
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {wakingBackend && !error && (
        <p className="text-sm text-muted-foreground">
          Still working — our support desk is waking up. This can take up to a minute on the first enquiry of the day.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-[0.2em] uppercase hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? "Opening Ticket…" : "Send Message"}
      </button>
    </form>
  )
}
