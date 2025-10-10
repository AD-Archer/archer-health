"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface NotificationSettings {
  mealReminders: boolean
  workoutReminders: boolean
  goalAchievements: boolean
  weeklyReports: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

interface NotificationSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSettingsModal({ open, onOpenChange }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    mealReminders: true,
    workoutReminders: true,
    goalAchievements: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notification-settings')
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save settings')
      }

      const data = await response.json()
      setSettings(data.settings)
      setHasChanges(false)
      toast.success('Notification settings saved successfully')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    setHasChanges(true)
  }

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmClose) return
    }
    onOpenChange(false)
    setHasChanges(false)
  }

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Notification Settings</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-48"></div>
                  </div>
                  <div className="w-11 h-6 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="h-5 bg-muted rounded animate-pulse w-32"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-48"></div>
                  </div>
                  <div className="w-11 h-6 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Meal Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded to log your meals</p>
                  </div>
                  <Switch
                    checked={settings.mealReminders}
                    onCheckedChange={() => toggleSetting("mealReminders")}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Workout Reminders</Label>
                    <p className="text-sm text-muted-foreground">Stay on track with your fitness</p>
                  </div>
                  <Switch
                    checked={settings.workoutReminders}
                    onCheckedChange={() => toggleSetting("workoutReminders")}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Achievements</Label>
                    <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
                  </div>
                  <Switch
                    checked={settings.goalAchievements}
                    onCheckedChange={() => toggleSetting("goalAchievements")}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Get weekly progress summaries</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={() => toggleSetting("weeklyReports")}
                    disabled={isSaving}
                  />
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
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get instant mobile alerts</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={() => toggleSetting("pushNotifications")}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {hasChanges && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    loadSettings()
                    setHasChanges(false)
                  }}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
