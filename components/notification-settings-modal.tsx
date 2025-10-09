"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface NotificationSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSettingsModal({ open, onOpenChange }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState({
    mealReminders: true,
    workoutReminders: true,
    goalAchievements: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Notification Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to log your meals</p>
              </div>
              <Switch checked={settings.mealReminders} onCheckedChange={() => toggleSetting("mealReminders")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">Stay on track with your fitness</p>
              </div>
              <Switch checked={settings.workoutReminders} onCheckedChange={() => toggleSetting("workoutReminders")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goal Achievements</Label>
                <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
              </div>
              <Switch checked={settings.goalAchievements} onCheckedChange={() => toggleSetting("goalAchievements")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Get weekly progress summaries</p>
              </div>
              <Switch checked={settings.weeklyReports} onCheckedChange={() => toggleSetting("weeklyReports")} />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Delivery Methods</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => toggleSetting("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get instant mobile alerts</p>
              </div>
              <Switch checked={settings.pushNotifications} onCheckedChange={() => toggleSetting("pushNotifications")} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
