"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function NutritionBreakdown() {
  const macros = [
    { name: "Protein", value: 85, target: 120, color: "bg-primary", percentage: 71 },
    { name: "Carbs", value: 145, target: 180, color: "bg-blue-500", percentage: 81 },
    { name: "Fat", value: 42, target: 55, color: "bg-orange-500", percentage: 76 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {macros.map((macro) => (
          <div key={macro.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{macro.name}</span>
              <span className="text-sm text-muted-foreground">
                {macro.value}g / {macro.target}g
              </span>
            </div>
            <Progress value={macro.percentage} className="h-3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
