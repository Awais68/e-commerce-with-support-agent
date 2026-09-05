export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  }
}

export function isStripeConfigured() {
  const { secretKey, publishableKey } = getStripeConfig()
  return Boolean(secretKey && publishableKey)
}

export function getNayapayConfig() {
  return {
    username: process.env.NAYAPAY_API_USERNAME || "",
    password: process.env.NAYAPAY_API_PASSWORD || "",
    merchantId: process.env.NAYAPAY_MERCHANT_ID || "",
    channel: process.env.NAYAPAY_CHANNEL || "WEB",
    currency: process.env.NAYAPAY_CURRENCY || "PKR",
    baseUrl: process.env.NAYAPAY_API_URL || "https://api.sandbox.nayapay.com/1.1",
    checkoutUrl: process.env.NAYAPAY_CHECKOUT_URL || "https://www.sandbox.nayapay.com/1.1/transaction",
  }
}

export function isNayapayConfigured() {
  const config = getNayapayConfig()
  return Boolean(config.username && config.password && config.merchantId)
}

export function nayapayHeaders(config: ReturnType<typeof getNayapayConfig>) {
  return {
    "Content-Type": "application/json",
    "api-username": config.username,
    "api-password": config.password,
    "channel": config.channel,
    "merchant-id": config.merchantId,
  }
}

export function generateOrderReference() {
  return `SN-${Date.now().toString(36).toUpperCase()}`
}

/**
 * Resolves the public base URL for redirect/callback URLs.
 * Prefers NEXT_PUBLIC_SITE_URL so proxied/deployed environments build correct URLs.
 */
export function getBaseUrl(fallbackOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  return (configured || fallbackOrigin).replace(/\/+$/, "")
}

/**
 * Stripe rejects relative paths in `product_data.images` with "Not a valid URL".
 * Turns a local path like "/coat.jpg" into an absolute URL, and drops anything
 * that is not http(s) (data URIs, blob URLs, empty values).
 */
export function toAbsoluteImageUrl(image: string | undefined, baseUrl: string): string | null {
  const raw = image?.trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (!raw.startsWith("/")) return null
  try {
    return new URL(raw, `${baseUrl}/`).toString()
  } catch {
    return null
  }
}

/**
 * Cash on Delivery. No gateway involved, so the only real controls are an
 * order-value ceiling (cash risk) and a verified phone number for the rider.
 */
export function getCodConfig() {
  return {
    enabled: process.env.COD_ENABLED !== "false",
    maxOrderValue: Number(process.env.COD_MAX_ORDER_VALUE) || 200000,
    courier: process.env.COD_DEFAULT_COURIER || "TCS Express",
    etaDays: Number(process.env.COD_ETA_DAYS) || 5,
  }
}
