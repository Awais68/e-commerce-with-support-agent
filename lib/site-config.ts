export const siteConfig = {
  brand: "Awais Niaz",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567",
  whatsappMessage: "Hello Awais Niaz, I would like some assistance.",
  conciergeEmail: "concierge@awaisniaz.com",
}

export function whatsappUrl(message: string = siteConfig.whatsappMessage): string {
  const number = siteConfig.whatsappNumber.replace(/[^0-9]/g, "")
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}