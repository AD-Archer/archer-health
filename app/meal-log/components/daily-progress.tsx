"use client"

import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function DailyProgress() {
  const user = useStore((state) => state.user)
  const mealEntries = useStore((state) => state.mealEntries)

  const today = new Date().toISOString().split("T")[0]
  const todayEntries = mealEntries.filter((entry) => entry.date.startsWith(today))

  const totals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const caloriesPercent = (totals.calories / user.dailyCalorieGoal) * 100
  const proteinPercent = (totals.protein / user.macroGoals.protein) * 100
  const carbsPercent = (totals.carbs / user.macroGoals.carbs) * 100
  const fatPercent = (totals.fat / user.macroGoals.fat) * 100

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-lg font-semibold">Calories</h3>
            <div className="text-sm">
              <span className="text-2xl font-bold">{Math.round(totals.calories)}</span>
              <span className="text-muted-foreground"> / {user.dailyCalorieGoal}</span>
            </div>
          </div>
          <Progress value={Math.min(caloriesPercent, 100)} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Protein</h4>
              <div className="text-xs">
                <span className="font-semibold">{Math.round(totals.protein)}g</span>
                <span className="text-muted-foreground"> / {user.macroGoals.protein}g</span>
              </div>
            </div>
            <Progress value={Math.min(proteinPercent, 100)} className="h-2" />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Carbs</h4>
              <div className="text-xs">
                <span className="font-semibold">{Math.round(totals.carbs)}g</span>
                <span className="text-muted-foreground"> / {user.macroGoals.carbs}g</span>
              </div>
            </div>
            <Progress value={Math.min(carbsPercent, 100)} className="h-2" />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Fat</h4>
              <div className="text-xs">
                <span className="font-semibold">{Math.round(totals.fat)}g</span>
                <span className="text-muted-foreground"> / {user.macroGoals.fat}g</span>
              </div>
            </div>
            <Progress value={Math.min(fatPercent, 100)} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  )
}
