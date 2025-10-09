"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "@/app/data/data"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useStore()
  const [formData, setFormData] = useState<Partial<User>>({ ...user })
  const [waterUnit, setWaterUnit] = useState<string>(user.units === "imperial" ? "oz" : "ml")

  const handleSave = () => {
    updateUser({ ...formData, waterGoalUnit: waterUnit as User["waterGoalUnit"] })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-center">Welcome! Let's set up your profile & goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6">
              {/* Name & Email */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {/* Weight Section */}
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={formData.currentWeight ?? ""}
                  onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal Weight</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  value={formData.goalWeight ?? ""}
                  onChange={(e) => setFormData({ ...formData, goalWeight: Number(e.target.value) })}
                />
              </div>
              {/* Height, Age, Gender */}
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height ?? ""}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age ?? ""}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || "other"}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as User["gender"] })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Activity Level */}
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={formData.activityLevel || "moderate"}
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value as User["activityLevel"] })}
                >
                  <SelectTrigger id="activityLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very-active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Goal Type & Weekly Goal */}
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={formData.goalType || "maintain"}
                  onValueChange={(value) => setFormData({ ...formData, goalType: value as User["goalType"] })}
                >
                  <SelectTrigger id="goalType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyGoal">Weekly Goal (lbs/week)</Label>
                <Input
                  id="weeklyGoal"
                  type="number"
                  value={formData.weeklyGoal ?? ""}
                  onChange={(e) => setFormData({ ...formData, weeklyGoal: Number(e.target.value) })}
                />
              </div>
              {/* Units & Timezone */}
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Select
                  value={formData.units || "imperial"}
                  onValueChange={(value) => setFormData({ ...formData, units: value as User["units"] })}
                >
                  <SelectTrigger id="units">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (lbs, inches, oz)</SelectItem>
                    <SelectItem value="metric">Metric (kg, cm, ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  value={formData.timezone || ""}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                />
              </div>
              {/* Water Goal */}
              <div className="space-y-2">
                <Label htmlFor="waterGoal">Water Goal</Label>
                <div className="flex gap-2">
                  <Input
                    id="waterGoal"
                    type="number"
                    value={formData.waterGoal ?? ""}
                    onChange={(e) => setFormData({ ...formData, waterGoal: Number(e.target.value) })}
                  />
                  <Select value={waterUnit} onValueChange={setWaterUnit}>
                    <SelectTrigger id="waterUnit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Save Button */}
              <Button className="w-full mt-6" onClick={handleSave}>
                Finish Setup
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
