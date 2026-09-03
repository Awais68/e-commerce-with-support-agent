"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Settings, LogOut, ContactRound, UserRound } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/use-auth"

const accountLinks = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const GenderIcon = user?.gender === "female" ? ContactRound : UserRound

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      {user && (
        <div className="flex items-center gap-4 px-4 py-4 mb-6 border border-border">
          <Avatar className="h-12 w-12 border border-border">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.firstName} />
            ) : (
              <AvatarFallback className="text-muted-foreground">
                <GenderIcon className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "SN Customer"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
      <nav className="space-y-1">
        {accountLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors relative ${
                isActive ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="account-sidebar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground"
                  transition={{ duration: 0.2 }}
                />
              )}
              <link.icon className="h-4 w-4 stroke-[1.5]" />
              {link.label}
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4 stroke-[1.5]" />
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
