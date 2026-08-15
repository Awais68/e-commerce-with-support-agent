import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { CartProvider } from "@/lib/cart-context"
import { SupportAgent } from "@/components/support-agent"
import { WhatsAppButton } from "@/components/whatsapp-button"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Awais Niaz | Luxury Essentials",
  description: "Timeless elegance, modern refinement. Discover our curated collection of luxury essentials.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased`}>
        <SmoothScrollProvider>
          <CartProvider>{children}</CartProvider>
          <SupportAgent />
          <WhatsAppButton />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
