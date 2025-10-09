"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user, updateUser } = useStore()
  const [formData, setFormData] = useState({
    currentWeight: user.currentWeight,
    goalWeight: user.goalWeight,
    height: user.height,
    age: user.age,
    gender: user.gender,
    goalType: user.goalType,
    weeklyGoal: user.weeklyGoal,
    units: user.units,
    timezone: user.timezone,
  })

  const handleSave = () => {
    updateUser(formData)
    onOpenChange(false)
  }

  const commonTimezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Profile & Goals</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Weight Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Weight Information</h3>

              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight ({formData.units === "imperial" ? "lbs" : "kg"})</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData({ ...formData, currentWeight: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal Weight ({formData.units === "imperial" ? "lbs" : "kg"})</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData({ ...formData, goalWeight: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value: "lose" | "maintain" | "gain") => setFormData({ ...formData, goalType: value })}
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
                <Label htmlFor="weeklyGoal">Weekly Goal ({formData.units === "imperial" ? "lbs" : "kg"}/week)</Label>
                <Select
                  value={formData.weeklyGoal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, weeklyGoal: Number.parseFloat(value) })}
                >
                  <SelectTrigger id="weeklyGoal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 {formData.units === "imperial" ? "lbs" : "kg"}/week</SelectItem>
                    <SelectItem value="1">1 {formData.units === "imperial" ? "lb" : "kg"}/week</SelectItem>
                    <SelectItem value="1.5">1.5 {formData.units === "imperial" ? "lbs" : "kg"}/week</SelectItem>
                    <SelectItem value="2">2 {formData.units === "imperial" ? "lbs" : "kg"}/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>

              <div className="space-y-2">
                <Label htmlFor="height">Height ({formData.units === "imperial" ? "inches" : "cm"})</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number.parseFloat(e.target.value) })}
                />
                {formData.units === "imperial" && (
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(formData.height / 12)}'{formData.height % 12}"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "male" | "female" | "other") => setFormData({ ...formData, gender: value })}
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
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Select
                  value={formData.units}
                  onValueChange={(value: "metric" | "imperial") => setFormData({ ...formData, units: value })}
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
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTimezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-dark">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
