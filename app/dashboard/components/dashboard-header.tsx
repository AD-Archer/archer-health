"use client"

import { Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export function DashboardHeader() {
  const today = format(new Date(), "EEEE, MMM d, yyyy")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Button variant="outline" size="icon">
          <Calendar className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search foods, meals, workouts..." className="pl-10" />
      </div>
    </div>
  )
}
