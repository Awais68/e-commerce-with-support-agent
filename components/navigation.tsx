"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LifeBuoy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MiniCart } from "./mini-cart"
import { useCart } from "@/lib/cart-context"
import { catalogCategories } from "@/lib/catalog"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const collectionsRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { count, openCart } = useCart()

  const shopCategories = catalogCategories.filter((c) => c !== "All")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setIsCollectionsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
        setIsCollectionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/heritage", label: "Heritage" },
    { href: "/support", label: "Support" },
  ]

  const navItemColor = isScrolled ? "text-foreground" : "text-white"
  const navItemHoverColor = isScrolled ? "text-foreground/60 hover:text-foreground" : "text-white/70 hover:text-white"
  const iconColor = isScrolled ? "text-foreground" : "text-white"

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] h-16 lg:h-20 items-center justify-between lg:justify-normal">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 -ml-2 transition-colors duration-500 ${iconColor}`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-[0.2em] uppercase transition-colors duration-500 ${
                    pathname === link.href ? navItemColor : navItemHoverColor
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Collections dropdown */}
              <div ref={collectionsRef} className="relative">
                <button
                  onClick={() => setIsCollectionsOpen((v) => !v)}
                  aria-expanded={isCollectionsOpen}
                  className={`flex items-center gap-1.5 text-sm tracking-[0.2em] uppercase transition-colors duration-500 ${
                    isCollectionsOpen ? navItemColor : navItemHoverColor
                  }`}
                >
                  Collections
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      isCollectionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isCollectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-1/2 top-full mt-4 -translate-x-1/2 w-[440px] rounded-xl border border-border bg-background p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]"
                    >
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {shopCategories.map((category) => (
                          <Link
                            key={category}
                            href={`/shop?category=${encodeURIComponent(category)}`}
                            onClick={() => setIsCollectionsOpen(false)}
                            className="text-sm text-foreground/70 transition-colors hover:text-foreground hover:underline underline-offset-4"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/shop"
                        onClick={() => setIsCollectionsOpen(false)}
                        className="mt-6 block border-t border-border pt-4 text-xs tracking-[0.2em] uppercase text-foreground"
                      >
                        Shop All Collections
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:justify-self-center whitespace-nowrap font-serif text-xl lg:text-2xl tracking-[0.3em] uppercase text-foreground"
            >
              SN
              <span className="mx-3 tracking-[0.45em]">Collections</span>
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-2 lg:gap-4 lg:justify-self-end">
              <div ref={searchContainerRef} className="relative hidden sm:flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className={`w-full bg-transparent border-b text-sm py-1 pr-2 outline-none transition-colors duration-500 ${
                          isScrolled
                            ? "border-foreground/30 text-foreground placeholder:text-foreground/50"
                            : "border-white/30 text-white placeholder:text-white/50"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                  className={`p-2 transition-colors duration-500 ${iconColor}`}
                >
                  {isSearchOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Search className="h-5 w-5 stroke-[1.5]" />}
                </button>
              </div>

              <Link
                href="/support"
                aria-label="Customer agent"
                title="Customer Agent"
                className={`p-2 hidden sm:block transition-colors duration-500 ${iconColor}`}
              >
                <LifeBuoy className="h-5 w-5 stroke-[1.5]" />
              </Link>

              <Link
                href="/account/profile"
                aria-label="Account"
                className={`p-2 hidden sm:block transition-colors duration-500 ${iconColor}`}
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </Link>

              <button
                onClick={openCart}
                aria-label="Shopping cart"
                className={`p-2 -mr-2 relative transition-colors duration-500 ${iconColor}`}
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                <span
                  className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center transition-colors duration-500 ${
                    isScrolled ? "bg-foreground text-background" : "bg-white text-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-[300px] z-50 bg-background border-r border-border lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <span className="font-serif text-lg tracking-[0.2em] uppercase">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2" aria-label="Close menu">
                  <X className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>
              <nav className="px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-lg tracking-[0.15em] uppercase transition-colors ${
                      pathname === link.href ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-6 mt-2">
                  <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-4">Collections</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {shopCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/shop?category=${encodeURIComponent(category)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-sm tracking-[0.1em] uppercase transition-colors text-foreground/60 hover:text-foreground"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6 mt-2">
                  <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-4">Help</p>
                  <Link
                    href="/support"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4"
                  >
                    Customer Agent
                  </Link>
                  <Link
                    href="/track"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground"
                  >
                    Track Order
                  </Link>
                </div>
                <div className="border-t border-border pt-6 mt-2">
                  <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-4">Account</p>
                  <Link
                    href="/account/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground"
                  >
                    Orders
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mini cart */}
      <MiniCart />
    </>
  )
}