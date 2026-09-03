import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { CartProvider } from "@/lib/cart-context"
import { SupportAgent } from "@/components/support-agent"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Toaster } from "@/components/ui/sonner"
import { GlobalBackground } from "@/components/global-background"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "SN Collections | Luxury Essentials",
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
        <GlobalBackground />
        <SmoothScrollProvider>
          <CartProvider>{children}</CartProvider>
          <SupportAgent />
          <WhatsAppButton />
        </SmoothScrollProvider>
        <Toaster />
      </body>
    </html>
  )
}
