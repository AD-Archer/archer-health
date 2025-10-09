"use client"

import { useStore } from "@/lib/store"
import { Flame, Droplet, Activity, Target } from "lucide-react"
import { Card } from "@/components/ui/card"

export function QuickStats() {
  const user = useStore((state) => state.user)
  const waterIntake = useStore((state) => state.waterIntake)

  const stats = [
    {
      label: "Calories",
      value: "1,245",
      target: user.dailyCalorieGoal,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "Water",
      value: `${waterIntake}oz`,
      target: `${user.waterGoal}oz`,
      icon: Droplet,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Protein",
      value: "85g",
      target: `${user.macroGoals.protein}g`,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Weight",
      value: `${user.currentWeight}lbs`,
      target: `${user.goalWeight}lbs`,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground">
              of {stat.target} {stat.label.toLowerCase()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
