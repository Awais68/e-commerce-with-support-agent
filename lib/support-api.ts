import "server-only"

import webformContract from "./support-webform-contract.json"

/**
 * Thin client for the FastAPI support backend.
 *
 * SUPPORT_API_KEY is intentionally NOT NEXT_PUBLIC_ — every call goes through a
 * Next route handler so the key never reaches the browser.
 */

/**
 * Render's free tier sleeps after inactivity and cold-starts in roughly 30s, so
 * the default has to outlast that — otherwise the first request after an idle
 * period always dies as a 504 even though the backend is healthy.
 *
 * Override with SUPPORT_TIMEOUT_MS (milliseconds) to fail fast on always-on
 * infra, or to stretch further on a slower plan. Clamped to 1s..120s so a typo
 * cannot make the route hang past Vercel's function budget.
 */
const DEFAULT_SUPPORT_TIMEOUT_MS = 45_000
const MIN_SUPPORT_TIMEOUT_MS = 1_000
const MAX_SUPPORT_TIMEOUT_MS = 120_000

/** Read per call, not at module load, so the value follows the running env. */
export function supportTimeoutMs(): number {
  const raw = Number(process.env.SUPPORT_TIMEOUT_MS)
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_SUPPORT_TIMEOUT_MS
  return Math.min(Math.max(Math.trunc(raw), MIN_SUPPORT_TIMEOUT_MS), MAX_SUPPORT_TIMEOUT_MS)
}

/**
 * The webform payload contract, shared with scripts/check-support-contract.mjs.
 * A field renamed in one place and not the other is the exact failure that
 * shows up as an opaque 422 from FastAPI, so the shape is asserted in dev.
 */
export const WEBFORM_CONTRACT = webformContract as {
  endpoint: string
  method: string
  fields: Record<string, { kind: "required" | "extra"; type: string }>
}

export const WEBFORM_REQUIRED_FIELDS = Object.entries(WEBFORM_CONTRACT.fields)
  .filter(([, field]) => field.kind === "required")
  .map(([name]) => name)

/** Dev-only guard: the payload we are about to send still matches the contract. */
export function assertWebformContract(payload: Record<string, unknown>): void {
  const expected = Object.keys(WEBFORM_CONTRACT.fields)
  const actual = Object.keys(payload)
  const missing = expected.filter((key) => !actual.includes(key))
  const unknown = actual.filter((key) => !expected.includes(key))
  if (missing.length || unknown.length) {
    console.error(
      "[support] webform payload drifted from lib/support-webform-contract.json." +
        (missing.length ? ` Missing: ${missing.join(", ")}.` : "") +
        (unknown.length ? ` Unexpected: ${unknown.join(", ")}.` : "")
    )
  }
}

export class SupportApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown
  ) {
    super(message)
    this.name = "SupportApiError"
  }
}

export function supportApiBaseUrl(): string {
  const url = process.env.SUPPORT_API_URL
  if (!url) throw new SupportApiError("SUPPORT_API_URL is not configured.", 503)
  return url.replace(/\/+$/, "")
}

export function isSupportConfigured(): boolean {
  return Boolean(process.env.SUPPORT_API_URL)
}

function authHeaders(): Record<string, string> {
  const key = process.env.SUPPORT_API_KEY
  if (!key) return {}
  // Sent under both names so the backend can read whichever it expects.
  return { "X-API-Key": key, Authorization: `Bearer ${key}` }
}

interface SupportFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT"
  body?: unknown
  /** Extra query string params, undefined values dropped. */
  query?: Record<string, string | undefined>
}

/**
 * Always no-store: ticket state changes the moment an agent replies, and a
 * cached GET is exactly the stale-page bug we are avoiding here.
 */
export async function supportFetch<T = unknown>(path: string, options: SupportFetchOptions = {}): Promise<T> {
  const base = supportApiBaseUrl()
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value)
  }

  const controller = new AbortController()
  const timeoutMs = supportTimeoutMs()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError"
    throw new SupportApiError(
      aborted
        ? `Support service did not respond within ${Math.round(timeoutMs / 1000)}s. It may be waking up — please try again.`
        : "Support service is unreachable.",
      504,
      error instanceof Error ? error.message : String(error)
    )
  } finally {
    clearTimeout(timer)
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    throw new SupportApiError(extractDetail(payload) ?? `Support service returned ${response.status}.`, response.status, payload)
  }

  return payload as T
}

function extractDetail(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) return payload.trim()
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    const detail = record.detail ?? record.message ?? record.error
    if (typeof detail === "string") return detail
    // FastAPI validation errors arrive as a list of {loc, msg, type}.
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>).msg : null))
        .filter((msg): msg is string => typeof msg === "string")
      if (messages.length) return messages.join("; ")
    }
  }
  return null
}

/** Backends differ on casing/nesting; pull the ticket number out of any of them. */
export function readTicketNumber(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  const nested = (record.ticket ?? record.data) as Record<string, unknown> | undefined
  const candidates = [
    record.ticket_number,
    record.ticketNumber,
    record.number,
    record.id,
    nested?.ticket_number,
    nested?.ticketNumber,
    nested?.number,
    nested?.id,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
    if (typeof candidate === "number") return String(candidate)
  }
  return null
}
