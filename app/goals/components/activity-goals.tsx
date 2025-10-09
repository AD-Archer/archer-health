"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export function ActivityGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Activity Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-primary/10">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Fr Workouts 4 week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
