import type { ReactNode } from "react"
import { Navigation } from "./navigation"
import { PremiumFooter } from "./premium-footer"

export function StaticPage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="relative h-[45vh] lg:h-[55vh] flex items-center justify-center overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground to-foreground/95" />
        <div className="relative z-10 text-center px-6">
          <span className="text-xs tracking-[0.4em] uppercase text-background/60 mb-6 block">{eyebrow}</span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-background mb-6 leading-[1.1]">{title}</h1>
          <p className="text-background/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
      </section>
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </section>
      <PremiumFooter />
    </main>
  )
}