import { searchKnowledgeBase } from "./knowledge-base"
import { ragSearch, ragContextToString, isRagConfigured } from "./rag"

export interface LLMResponse {
  reply: string
  suggestions: string[]
}

const SYSTEM_PROMPT = `You are the SN AI assistant for SN Collections — a helpful, accurate operational assistant. You have access to LIVE data: orders, payments, order confirmations, dispatch/shipments (courier, tracking number, timeline, ETA), couriers and their delivery charges, and inventory (stock, prices, sizes, colors, categories, stock arrivals with supplier, invoice, date, who received it).

Rules:
- Answer ONLY from the context provided. If the context does not contain the answer, say you don't have that information yet and suggest what the customer can do (check the product page, or WhatsApp).
- When the customer asks about a specific order or tracking number, give the exact status, courier, tracking number, latest event and ETA from the context.
- When the customer asks about stock or inventory, report exact quantities, prices (PKR), available sizes/colors, and stock-arrival details (date, supplier, invoice, who received it) when present.
- Never invent orders, tracking numbers, prices, couriers, or facts.
- Be concise (under 140 words) and friendly.
- Reply with STRICT JSON only, no markdown, exact shape: {"reply":"answer text","suggestions":["follow-up 1","follow-up 2","follow-up 3"]}. Provide up to 3 short follow-up suggestions.`

export async function generateLLMResponse(query: string, opsContext = ""): Promise<LLMResponse | null> {
  const apiKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  let context = opsContext

  if (isRagConfigured()) {
    const rag = await ragSearch(query, 5)
    if (rag && (rag.kb.length > 0 || rag.products.length > 0 || rag.ops.length > 0)) {
      const ragText = ragContextToString(rag)
      context = context ? `${context}\n\n${ragText}` : ragText
    }
  }

  if (!context) {
    const results = searchKnowledgeBase(query, 4)
    context =
      results.length > 0
        ? results.map((r, i) => `## ${i + 1}. ${r.entry.title}\n${r.entry.answer}`).join("\n\n")
        : "(No matching knowledge base entries found.)"
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    const baseUrl = process.env.LLM_BASE_URL || process.env.GROQ_BASE_URL || "https://openrouter.ai/api/v1"
    const model = process.env.LLM_MODEL || process.env.GROQ_MODEL || "openai/gpt-4o-mini"

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }
    if (/openrouter\.ai/i.test(baseUrl)) {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL || "https://sncollections.com"
      headers["X-Title"] = "SN Collections"
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Knowledge base:\n\n${context}\n\nCustomer question: ${query}`,
          },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      console.error("LLM API error:", res.status, await res.text())
      return null
    }

    const data = await res.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content) as { reply?: unknown; suggestions?: unknown }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : ""
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s): s is string => typeof s === "string").slice(0, 3)
      : []

    if (!reply) return null
    return { reply, suggestions }
  } catch (error) {
    console.error("LLM request failed:", error)
    return null
  }
}