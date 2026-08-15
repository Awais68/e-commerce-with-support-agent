"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, MapPin, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"

const addresses = [
  {
    id: "1",
    label: "Home",
    default: true,
    name: "Alexandra Sinclair",
    street: "245 Park Avenue, Apt 42B",
    city: "New York",
    state: "NY",
    zip: "10167",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    label: "Office",
    default: false,
    name: "Alexandra Sinclair",
    street: "1 World Trade Center, 85th Floor",
    city: "New York",
    state: "NY",
    zip: "10007",
    country: "United States",
    phone: "+1 (555) 987-6543",
  },
]

export default function AddressesPage() {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your shipping addresses</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl">Saved Addresses</h2>
                <Button variant="outline" className="gap-2 text-sm tracking-[0.1em] uppercase bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative border p-6 transition-colors cursor-pointer ${
                      selectedAddress === address.id || address.default
                        ? "border-foreground"
                        : "border-border hover:border-foreground/50"
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    {address.default && (
                      <span className="absolute top-4 right-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                        Default
                      </span>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{address.label}</span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1 ml-7">
                      <p>{address.name}</p>
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                      <p className="pt-2">{address.phone}</p>
                    </div>

                    <div className="flex gap-4 mt-6 ml-7">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {!address.default && (
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}
