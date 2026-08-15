import { products, categories } from "./products"

export interface KnowledgeEntry {
  id: string
  title: string
  keywords: string[]
  answer: string
  suggestions?: string[]
}

const DEFAULT_SUGGESTIONS = [
  "What is your shipping policy?",
  "How do returns work?",
  "Do you have a size guide?",
  "Where are your products made?",
]

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "greeting",
    title: "Greeting",
    keywords: ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening", "good afternoon", "help", "start"],
    answer:
      "Welcome to SN Collections. I am your personal concierge — here to assist you with our luxury collection, orders, shipping, returns and care. How may I help you today?",
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: "shipping",
    title: "Shipping",
    keywords: ["shipping", "ship", "delivery", "deliver", "dispatch", "send", "courier", "dhl", "fedex", "postage"],
    answer:
      "We ship worldwide from Florence, Italy. Orders are dispatched within 24–48 hours. Standard delivery arrives in 3–5 business days, and express delivery in 1–2 business days. Shipping is complimentary on all orders over $500. Signature required on delivery for orders over $1,000.",
    suggestions: ["Where do you ship?", "How fast is express delivery?", "What about returns?"],
  },
  {
    id: "shipping-overseas",
    title: "Shipping overseas",
    keywords: ["worldwide", "international", "overseas", "abroad", "pakistan", "usa", "uk", "europe", "gulf", "dubai"],
    answer:
      "We deliver worldwide, including Pakistan, the USA, the UK, Europe and the Gulf. International orders are shipped via insured express courier with full tracking. Import duties and taxes are calculated and shown at checkout for most destinations, so there are no surprises at your door.",
    suggestions: ["How long does international delivery take?", "What is your return policy?"],
  },
  {
    id: "tracking",
    title: "Tracking",
    keywords: ["track", "tracking", "where is my order", "status", "arrive", "arrived", "delay", "delayed"],
    answer:
      "Once your order ships, you will receive an email with a tracking number. You can also message us through the concierge chat and we will check the live status for you. Delivery is usually 3–5 business days domestically and 5–10 business days internationally.",
    suggestions: ["I want to change my order", "Start a return"],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    keywords: ["return", "returns", "refund", "refunds", "exchange", "change", "send back", "cancel order", "returned"],
    answer:
      "We offer complimentary returns and exchanges within 30 days of delivery. Items must be unworn, unwashed and in their original packaging with tags attached. Refunds are issued to your original payment method within 5–7 business days after inspection. Custom and personalised pieces are final sale.",
    suggestions: ["How do I start a return?", "When will I get my refund?", "What is your shipping policy?"],
  },
  {
    id: "payments",
    title: "Payments",
    keywords: ["pay", "payment", "card", "credit", "debit", "visa", "mastercard", "paypal", "cash", "on delivery", "cod", "bank", "installment", "installments", "emi", "checkout"],
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and secure bank transfers. In select regions we also offer installment payment at checkout. All transactions are encrypted and processed securely — we never store your card details.",
    suggestions: ["Is my payment secure?", "How do I get an invoice?"],
  },
  {
    id: "sizing",
    title: "Size guide",
    keywords: ["size", "sizes", "fit", "sizing", "measure", "measurement", "measurements", "small", "medium", "large", "xl", "inch", "cm", "true to size"],
    answer:
      "Our pieces are cut true to size in European sizing. For garments, compare your chest, waist and hip measurements against the size chart on each product page. If you are between sizes, we recommend sizing up for a relaxed fit. Shoes are available in EU sizing 36–44. Need help finding your fit? Ask me for a specific product.",
    suggestions: ["What size is available for the Silk Evening Coat?", "How do I care for cashmere?"],
  },
  {
    id: "care",
    title: "Care instructions",
    keywords: ["care", "wash", "washing", "clean", "cleaning", "dry clean", "iron", "maintain", "maintenance", "condition"],
    answer:
      "Every piece includes care guidance on its product page. As a rule: silk and wool garments should be dry cleaned only; cashmere and merino should be hand washed cold and laid flat to dry; leather should be conditioned with a balm and stored away from direct sunlight. Ask me about a specific product for its care details.",
    suggestions: ["How do I care for my leather belt?", "Where are products made?"],
  },
  {
    id: "orders",
    title: "Orders & account",
    keywords: ["order", "orders", "my order", "invoice", "receipt", "placed", "confirm", "confirmation", "modify", "cancel"],
    answer:
      "Your order confirmation is emailed to you immediately after purchase. You can modify shipping details or cancel an order within 12 hours of placement. For anything else, the concierge here can check your order live — just share your order number and we will take care of it.",
    suggestions: ["Where is my order?", "What is your return policy?"],
  },
  {
    id: "products",
    title: "Product selection",
    keywords: ["product", "products", "recommend", "recommendation", "suggest", "suggestions", "gift", "what should i buy", "bestseller", "collection", "catalog", "catalogue"],
    answer:
      "Our collection spans outerwear, dresses, knitwear, trousers, accessories, baby and children's pieces, and shoes — each hand-finished in Florence, Italy. I can recommend a piece based on your occasion, or direct you to a specific category. What are you looking for?",
    suggestions: ["Show me your shoes", "Something for a baby", "Do you have knitwear?"],
  },
  {
    id: "craftsmanship",
    title: "Craftsmanship & origin",
    keywords: ["made", "made in", "crafted", "craftsmanship", "artisan", "material", "materials", "fabric", "leather", "silk", "cashmere", "wool", "linen", "quality", "origin", "italy", "florence", "sustainable", "ethically"],
    answer:
      "Every SN Collections piece is crafted by master artisans in Florence and Como, Italy, using materials such as Grade-A Mongolian cashmere, mulberry silk, Super 150s wool and full-grain calf leather. We are committed to sustainable, ethical production and each piece carries a numbered authenticity tag.",
    suggestions: ["Tell me about your cashmere", "What is your shipping policy?"],
  },
  {
    id: "warranty",
    title: "Authenticity & warranty",
    keywords: ["warranty", "guarantee", "authentic", "authenticity", "certificate", "genuine", "repair", "restore", "defect", "defective"],
    answer:
      "Every purchase includes a numbered authenticity tag and is covered by our craftsmanship warranty for two years against defects in materials and workmanship. We also offer a lifetime repair service for our leather goods and footwear, so your pieces can be cherished for decades.",
    suggestions: ["Where are your products made?", "How do I care for leather?"],
  },
  {
    id: "gift",
    title: "Gift wrapping & personal shopper",
    keywords: ["gift", "gift wrap", "wrapping", "personal shopper", "stylist", "styling", "occasion", "anniversary", "birthday", "wedding"],
    answer:
      "Complimentary gift wrapping with a handwritten note is available on every order. For special occasions, our personal stylists can curate a complete look and can even schedule a private virtual appointment. Just tell me the occasion and the recipient, and I will arrange everything.",
    suggestions: ["Recommend a gift", "What is your return policy?"],
  },
  {
    id: "contact",
    title: "Contact & human concierge",
    keywords: ["contact", "human", "agent", "person", "real", "call", "phone", "email", "talk", "speak", "representative", "live", "whatsapp", "support"],
    answer:
      "For personal assistance, our human concierge team is available 7 days a week. You can reach us instantly on WhatsApp (tap the green button on the right) or email concierge@sncollections.com. If you need me to transfer you to a live agent, just say 'connect me to an agent'.",
    suggestions: ["Chat on WhatsApp", "What is your shipping policy?"],
  },
  {
    id: "promotions",
    title: "Promotions & membership",
    keywords: ["discount", "discounts", "promo", "promotion", "offer", "offers", "sale", "deal", "coupon", "voucher", "membership", "loyalty", "newsletter", "subscribe"],
    answer:
      "As a new member you can receive exclusive private previews and early access to collections. Follow us to be the first to know about seasonal offers and private sale events. There are no active public discount codes at the moment — our best offers go to members first.",
    suggestions: ["Tell me about the collection", "What is your shipping policy?"],
  },
  {
    id: "default",
    title: "Default",
    keywords: [],
    answer:
      "I want to make sure I answer you perfectly. Could you rephrase that, or ask me about shipping, returns, sizing, payments, care or a specific product? You can also tap below to reach a human concierge on WhatsApp at any time.",
    suggestions: DEFAULT_SUGGESTIONS,
  },
]

function productEntries(): KnowledgeEntry[] {
  return products.map((p) => ({
    id: `product-${p.id}`,
    title: p.name,
    keywords: [
      p.name.toLowerCase(),
      ...p.name.toLowerCase().split(" "),
      p.category.toLowerCase(),
      ...p.materials.map((m) => m.toLowerCase()),
    ],
    answer: `${p.name} — ${p.price.toLocaleString()} USD. ${p.description}. Crafted from ${p.materials.join(
      ", "
    )} and made in ${p.madeIn}. ${
      p.sizes.some((s) => s.available)
        ? `Available sizes: ${p.sizes.filter((s) => s.available).map((s) => s.size).join(", ")}.`
        : ""
    } ${
      p.colors.some((c) => c.available)
        ? `Available colors: ${p.colors.filter((c) => c.available).map((c) => c.name).join(", ")}.`
        : ""
    } Would you like to add it to your bag, or know more about its care?`,
    suggestions: [`How do I care for the ${p.name}?`, "What is your shipping policy?", "Where is it made?"],
  }))
}

function categoryEntries(): KnowledgeEntry[] {
  return categories
    .filter((c) => c !== "All")
    .map((c) => {
      const items = products.filter((p) => p.category === c)
      return {
        id: `category-${c.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${c} collection`,
        keywords: [c.toLowerCase()],
        answer:
          items.length > 0
            ? `In our ${c} collection we currently offer: ${items
                .map((p) => `${p.name} at ${p.price.toLocaleString()} USD`)
                .join(", ")}. Would you like more details on any of these pieces?`
            : `Our ${c} collection features a curated selection of pieces sourced from our partner houses. You can browse the full ${c} edit in the Collections menu on the website.`,
        suggestions: items.length > 0 ? items.slice(0, 3).map((p) => `Tell me about the ${p.name}`) : DEFAULT_SUGGESTIONS,
      }
    })
}

const allEntries: KnowledgeEntry[] = [...knowledgeBase, ...productEntries(), ...categoryEntries()]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function tokenize(text: string): string[] {
  const normalized = normalize(text)
  const stopWords = new Set([
    "the", "a", "an", "i", "me", "my", "you", "your", "is", "are", "am", "do", "does", "can", "could",
    "will", "would", "should", "of", "in", "on", "at", "to", "for", "with", "and", "or", "about", "how",
    "what", "tell", "want", "like", "please", "kindly", "need", "have", "has", "that", "this", "these",
    "those", "it", "its", "please", "thanks", "thank", "hi", "hello", "hey", "any", "some", "get",
  ])
  return normalized.split(" ").filter((w) => w.length > 1 && !stopWords.has(w))
}

export interface KnowledgeResult {
  entry: KnowledgeEntry
  score: number
}

export function searchKnowledgeBase(query: string, limit = 3): KnowledgeResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) {
    const greeting = allEntries.find((e) => e.id === "greeting") ?? allEntries[0]
    return [{ entry: greeting, score: 0 }]
  }

  const scored: KnowledgeResult[] = allEntries
    .map((entry) => {
      const entryText = normalize(`${entry.title} ${entry.keywords.join(" ")}`)
      let score = 0
      for (const token of tokens) {
        if (entry.keywords.some((k) => k === token)) {
          score += entry.id.startsWith("category-") ? 15 : 10
        } else if (entry.keywords.some((k) => k.includes(token))) {
          score += 3
        } else if (entryText.includes(token)) {
          score += 1
        }
        const matched = entry.keywords.filter((k) => k.includes(token)).length
        if (matched > 1) {
          score += Math.min(matched - 1, 2)
        }
      }
      return { entry, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    const fallback = allEntries.find((e) => e.id === "default") ?? allEntries[0]
    return [{ entry: fallback, score: 0 }]
  }

  return scored.slice(0, limit)
}

export function buildSupportResponse(query: string): { reply: string; suggestions: string[] } {
  const results = searchKnowledgeBase(query)
  const top = results[0]
  const suggestions = top.entry.suggestions ?? DEFAULT_SUGGESTIONS

  const related = results.slice(1).map((r) => r.entry)
  const relatedTitles = [...new Set(related.map((r) => r.title))]
    .filter((t) => t !== top.entry.title)
    .slice(0, 2)

  let reply = top.entry.answer
  if (relatedTitles.length > 0) {
    reply += `\n\nYou may also be interested in: ${relatedTitles.join(", ")}.`
  }
  return { reply, suggestions }
}

export { products, categories }