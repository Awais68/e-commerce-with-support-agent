import { searchKnowledgeBase } from "./knowledge-base"

export interface LLMResponse {
  reply: string
  suggestions: string[]
}

const SYSTEM_PROMPT = `You are the SN Collections concierge — a polished, warm luxury support agent for SN Collections, an Italian fashion house with ateliers in Florence and Como. Speak in fluent, natural English with an elegant but helpful tone. Be concise (under 130 words). Answer ONLY using the knowledge base provided in the user message. If the knowledge base does not cover the question, politely say you are unsure and recommend the customer's next best step (WhatsApp, or the product page). Never invent policies, prices, or facts. Reply with STRICT JSON only, with no markdown, in this exact shape: {"reply":"your answer text here","suggestions":["follow-up question 1","follow-up question 2","follow-up question 3"]}. Provide up to 3 short follow-up suggestion questions that help the customer continue.`

export async function generateLLMResponse(query: string): Promise<LLMResponse | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const results = searchKnowledgeBase(query, 4)
  const context =
    results.length > 0
      ? results.map((r, i) => `## ${i + 1}. ${r.entry.title}\n${r.entry.answer}`).join("\n\n")
      : "(No matching knowledge base entries found.)"

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
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