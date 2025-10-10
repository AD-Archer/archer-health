"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserProfile {
  name?: string
  email?: string
  currentWeight?: number
  goalWeight?: number
  height?: number
  heightFeet?: number
  heightInches?: number
  age?: number
  gender?: "male" | "female" | "other"
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very-active"
  goalType?: "lose" | "maintain" | "gain"
  weeklyGoal?: number
  units?: "imperial" | "metric"
  timezone?: string
  waterGoal?: number
  waterGoalUnit?: string
}

// Timezone options
const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata",
  "Australia/Sydney", "Pacific/Auckland", "America/Toronto", "America/Vancouver",
  "America/Mexico_City", "America/Sao_Paulo", "Africa/Cairo", "Asia/Dubai"
]

// Weekly goal options based on goal type
const getWeeklyGoalOptions = (goalType: string) => {
  if (goalType === "lose") {
    return [
      { value: 0.5, label: "0.5 lbs per week (Safe & Sustainable)" },
      { value: 1, label: "1 lb per week (Recommended)" },
      { value: 1.5, label: "1.5 lbs per week (Aggressive)" },
      { value: 2, label: "2 lbs per week (Very Aggressive)" }
    ]
  } else if (goalType === "gain") {
    return [
      { value: 0.5, label: "0.5 lbs per week (Slow & Steady)" },
      { value: 1, label: "1 lb per week (Moderate)" },
      { value: 1.5, label: "1.5 lbs per week (Fast)" },
      { value: 2, label: "2 lbs per week (Very Fast)" }
    ]
  }
  return []
}

// Auto-calculate water goal based on weight and activity level
const calculateWaterGoal = (weight: number | undefined, units: string, activityLevel: string): number => {
  if (!weight) return 0

  // Base calculation: 1 oz per kg of body weight for imperial, 30ml per kg for metric
  let baseWater: number
  if (units === "imperial") {
    // Convert lbs to kg for calculation
    const weightKg = weight * 0.453592
    baseWater = weightKg * 30 // 30ml per kg
    // Convert to oz
    baseWater = baseWater * 0.033814
  } else {
    baseWater = weight * 30 // 30ml per kg
  }

  // Activity level multiplier
  const activityMultiplier = {
    "sedentary": 1.0,
    "light": 1.2,
    "moderate": 1.4,
    "active": 1.6,
    "very-active": 1.8
  }[activityLevel] || 1.0

  return Math.round(baseWater * activityMultiplier)
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [formData, setFormData] = useState<UserProfile>({})
  const [waterUnit, setWaterUnit] = useState<string>("oz")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill with Clerk user data and auto-detect timezone
  useEffect(() => {
    if (isLoaded && user) {
      // Auto-detect timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      setFormData({
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        timezone: TIMEZONES.includes(userTimezone) ? userTimezone : "America/New_York",
        units: "imperial", // Default to imperial
      })
    }
  }, [user, isLoaded])

  // Auto-calculate water goal when weight or activity level changes
  useEffect(() => {
    if (formData.currentWeight && formData.activityLevel && formData.units) {
      const calculatedWater = calculateWaterGoal(formData.currentWeight, formData.units, formData.activityLevel)
      setFormData(prev => ({ ...prev, waterGoal: calculatedWater }))
    }
  }, [formData.currentWeight, formData.activityLevel, formData.units])

  // Convert height when units change
  useEffect(() => {
    if (formData.units === "metric" && formData.heightFeet && formData.heightInches) {
      // Convert feet/inches to cm
      const totalInches = (formData.heightFeet * 12) + formData.heightInches
      const cm = totalInches * 2.54
      setFormData(prev => ({ ...prev, height: Math.round(cm) }))
    } else if (formData.units === "imperial" && formData.height) {
      // Convert cm to feet/inches
      const totalInches = formData.height / 2.54
      const feet = Math.floor(totalInches / 12)
      const inches = Math.round(totalInches % 12)
      setFormData(prev => ({ ...prev, heightFeet: feet, heightInches: inches }))
    }
  }, [formData.units])

  const handleSave = async () => {
    if (!isLoaded || !user) return

    setIsLoading(true)
    setError("")
    try {
      // Prepare data for API - convert height if needed
      let finalData = { ...formData }
      if (formData.units === "imperial" && formData.heightFeet && formData.heightInches) {
        finalData.height = (formData.heightFeet * 12) + formData.heightInches
      }

      const response = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...finalData,
          waterGoalUnit: waterUnit,
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || `Failed to save profile (${response.status})`)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
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
                <Label htmlFor="currentWeight">Current Weight ({formData.units === "imperial" ? "lbs" : "kg"})</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={formData.currentWeight ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, currentWeight: value === "" ? undefined : Number(value) });
                  }}
                  placeholder={`Enter weight in ${formData.units === "imperial" ? "pounds" : "kilograms"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal Weight ({formData.units === "imperial" ? "lbs" : "kg"})</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  value={formData.goalWeight ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, goalWeight: value === "" ? undefined : Number(value) });
                  }}
                  placeholder={`Enter goal weight in ${formData.units === "imperial" ? "pounds" : "kilograms"}`}
                />
              </div>
              {/* Height Section */}
              <div className="space-y-2">
                <Label htmlFor="height">Height ({formData.units === "imperial" ? "feet & inches" : "cm"})</Label>
                {formData.units === "imperial" ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="heightFeet"
                        type="number"
                        value={formData.heightFeet ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, heightFeet: value === "" ? undefined : Number(value) });
                        }}
                        placeholder="Feet"
                        min="1"
                        max="8"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="heightInches"
                        type="number"
                        value={formData.heightInches ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, heightInches: value === "" ? undefined : Number(value) });
                        }}
                        placeholder="Inches"
                        min="0"
                        max="11"
                      />
                    </div>
                  </div>
                ) : (
                  <Input
                    id="height"
                    type="number"
                    value={formData.height ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, height: value === "" ? undefined : Number(value) });
                    }}
                    placeholder="Enter height in centimeters"
                  />
                )}
              </div>
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, age: value === "" ? undefined : Number(value) });
                  }}
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                />
              </div>
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || "other"}
                  onValueChange={(value: "male" | "female" | "other") => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
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
                  onValueChange={(value: "sedentary" | "light" | "moderate" | "active" | "very-active") => setFormData({ ...formData, activityLevel: value })}
                >
                  <SelectTrigger id="activityLevel">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (very hard exercise & physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Goal Type */}
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={formData.goalType || "maintain"}
                  onValueChange={(value: "lose" | "maintain" | "gain") => setFormData({ ...formData, goalType: value })}
                >
                  <SelectTrigger id="goalType">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Weekly Goal - only show for lose/gain goals */}
              {(formData.goalType === "lose" || formData.goalType === "gain") && (
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Weekly Goal ({formData.units === "imperial" ? "lbs" : "kg"}/week)</Label>
                  <Select
                    value={formData.weeklyGoal?.toString() || ""}
                    onValueChange={(value) => setFormData({ ...formData, weeklyGoal: Number(value) })}
                  >
                    <SelectTrigger id="weeklyGoal">
                      <SelectValue placeholder="Select your weekly goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {getWeeklyGoalOptions(formData.goalType).map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Units */}
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Select
                  value={formData.units || "imperial"}
                  onValueChange={(value: "imperial" | "metric") => setFormData({ ...formData, units: value })}
                >
                  <SelectTrigger id="units">
                    <SelectValue placeholder="Select your preferred units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (lbs, feet/inches, oz)</SelectItem>
                    <SelectItem value="metric">Metric (kg, cm, ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone || ""}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Water Goal - Auto-calculated */}
              <div className="space-y-2">
                <Label htmlFor="waterGoal">Daily Water Goal (Auto-calculated)</Label>
                <div className="flex gap-2">
                  <Input
                    id="waterGoal"
                    type="number"
                    value={formData.waterGoal ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, waterGoal: value === "" ? undefined : Number(value) });
                    }}
                    placeholder="Auto-calculated based on your weight and activity"
                  />
                  <Select value={waterUnit} onValueChange={setWaterUnit}>
                    <SelectTrigger id="waterUnit" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculated based on your weight ({formData.currentWeight} {formData.units === "imperial" ? "lbs" : "kg"}) 
                  and activity level. You can adjust this value if needed.
                </p>
              </div>
              {/* Save Button */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}
              <Button className="w-full mt-6" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Finish Setup"}
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
