"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function MealSummary() {
  const meals = [
    { name: "Breakfast", calories: 420, target: 450, color: "bg-orange-500" },
    { name: "Lunch", calories: 580, target: 600, color: "bg-primary" },
    { name: "Dinner", calories: 245, target: 500, color: "bg-blue-500" },
    { name: "Snacks", calories: 0, target: 100, color: "bg-purple-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Today's Meals</CardTitle>
          <Button size="sm" variant="ghost" className="text-primary">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{meal.name}</span>
              <span className="text-muted-foreground">
                {meal.calories} / {meal.target} cal
              </span>
            </div>
            <Progress value={(meal.calories / meal.target) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
