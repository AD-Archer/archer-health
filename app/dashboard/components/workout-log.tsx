"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronRight, Dumbbell, Heart, Bike, Activity } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"

const workoutIcons = {
  cardio: Bike,
  strength: Dumbbell,
  yoga: Heart,
  sports: Activity,
  other: Activity,
}

export function WorkoutLog() {
  const workouts = useStore((state) => state.workouts)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Workout Log</CardTitle>
          <Button size="sm" variant="ghost" className="text-primary">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workouts.slice(0, 4).map((workout) => {
          const Icon = workoutIcons[workout.type]
          return (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{workout.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {workout.notes || `${workout.duration} min, ${workout.caloriesBurned}cal`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
