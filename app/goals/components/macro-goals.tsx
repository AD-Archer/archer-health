"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Activity } from "lucide-react"

export function MacroGoals() {
  const user = useStore((state) => state.user)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Macro Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Protein</p>
            <p className="text-sm text-muted-foreground">1.5 0.00 min/day</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
