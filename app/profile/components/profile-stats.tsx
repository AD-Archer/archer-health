"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export function ProfileStats() {
  const user = useStore((state) => state.user)

  const stats = [
    { label: "Current Weight", value: `${user.currentWeight} lbs` },
    { label: "Goal Weight", value: `${user.goalWeight} lbs` },
    { label: "Height", value: `${Math.floor(user.height / 12)}'${user.height % 12}"` },
    { label: "Age", value: `${user.age} years` },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
