"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Target, BookOpen, Plus, TrendingUp, User, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AddEntryModal } from "@/components/add-entry-modal"

export function MobileNav() {
  const pathname = usePathname()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/meal-log", icon: UtensilsCrossed, label: "Log" },
    { href: "/recipes", icon: BookOpen, label: "Recipes" },
    { href: "/progress", icon: TrendingUp, label: "Progress" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center w-14 h-14 -mt-8 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>

          {navItems.slice(3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <AddEntryModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </>
  )
}
