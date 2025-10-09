"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"

export function WeightGoal() {
  const user = useStore((state) => state.user)
  const remaining = user.currentWeight - user.goalWeight
  const progress = ((user.currentWeight - user.goalWeight) / (user.currentWeight - user.goalWeight + remaining)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Ecolaffast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-display">{Math.abs(remaining)} lbs</span>
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">
              Weight Goal: {remaining > 0 ? "-" : "+"}
              {Math.abs(remaining)} lbs
            </p>
            <p className="text-sm text-muted-foreground">5 Ranainhnay</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
