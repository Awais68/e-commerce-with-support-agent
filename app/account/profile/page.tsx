"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"

export default function ProfilePage() {
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
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl mb-8">Personal Information</h2>

                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-xs tracking-wide uppercase text-muted-foreground">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        defaultValue="Alexandra"
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs tracking-wide uppercase text-muted-foreground">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        defaultValue="Sinclair"
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="alexandra.sinclair@email.com"
                      className="mt-2 border-border/50 focus:border-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="mt-2 border-border/50 focus:border-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthday" className="text-xs tracking-wide uppercase text-muted-foreground">
                      Birthday
                    </Label>
                    <Input
                      id="birthday"
                      type="date"
                      defaultValue="1988-06-15"
                      className="mt-2 border-border/50 focus:border-foreground"
                    />
                  </div>

                  <div className="pt-4">
                    <Button className="px-8 py-6 text-sm tracking-[0.15em] uppercase">Save Changes</Button>
                  </div>
                </form>

                {/* Password section */}
                <div className="mt-16 pt-16 border-t border-border">
                  <h2 className="font-serif text-2xl mb-8">Change Password</h2>

                  <form className="space-y-6">
                    <div>
                      <Label
                        htmlFor="currentPassword"
                        className="text-xs tracking-wide uppercase text-muted-foreground"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-xs tracking-wide uppercase text-muted-foreground">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="confirmPassword"
                        className="text-xs tracking-wide uppercase text-muted-foreground"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="px-8 py-6 text-sm tracking-[0.15em] uppercase bg-transparent"
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}
