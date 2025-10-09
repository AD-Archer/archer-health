"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Activity, Droplet, Apple, Plus } from "lucide-react"
import Link from "next/link"

export function AddOptions() {
  const options = [
    {
      label: "Log Meal",
      description: "Add breakfast, lunch, dinner, or snacks",
      icon: Utensils,
      href: "/add/meal",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Log Workout",
      description: "Track your exercise and activity",
      icon: Activity,
      href: "/add/workout",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Log Water",
      description: "Record your water intake",
      icon: Droplet,
      href: "/add/water",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      label: "Quick Add Calories",
      description: "Quickly add calories without details",
      icon: Plus,
      href: "/add/quick",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "Create Custom Food",
      description: "Add a new food to your database",
      icon: Apple,
      href: "/add/food",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => (
        <Link key={option.label} href={option.href}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${option.bgColor} group-hover:scale-110 transition-transform`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display mb-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
