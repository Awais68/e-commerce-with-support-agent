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