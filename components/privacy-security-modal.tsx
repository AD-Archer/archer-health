"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Download } from "lucide-react"
import { UserProfile } from "@clerk/nextjs"
import { useState } from "react"
import { useEffect } from "react"
import { toast } from "sonner"

interface PrivacySecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacySecurityModal({ open, onOpenChange }: PrivacySecurityModalProps) {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    activitySharing: false,
    dataCollection: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  // Removed account modal logic

  // Load settings from backend when modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      fetch("/api/privacy-settings")
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setSettings({
              profileVisibility: !!data.settings.profileVisibility,
              activitySharing: !!data.settings.activitySharing,
              dataCollection: !!data.settings.dataCollection,
            })
          }
        })
        .catch(() => {
          toast.error("Failed to load privacy settings.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [open])

  // Save settings to backend
  const saveSettings = async (newSettings: typeof settings) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })
      if (res.ok) {
        toast.success("Privacy settings saved!")
      } else {
        toast.error("Failed to save privacy settings.")
      }
    } catch {
      toast.error("Failed to save privacy settings.")
    } finally {
      setIsLoading(false)
    }
  }
  const toggleSetting = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    saveSettings(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Privacy & Security</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading && (
            <div className="text-center py-2 text-muted-foreground text-sm">Loading...</div>
          )}
          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
              </div>
              <Switch checked={settings.profileVisibility} onCheckedChange={() => toggleSetting("profileVisibility")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Sharing</Label>
                <p className="text-sm text-muted-foreground">Share your workouts and meals</p>
              </div>
              <Switch checked={settings.activitySharing} onCheckedChange={() => toggleSetting("activitySharing")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Collection</Label>
                <p className="text-sm text-muted-foreground">Help improve our services</p>
              </div>
              <Switch checked={settings.dataCollection} onCheckedChange={() => toggleSetting("dataCollection")} />
            </div>
          </div>

          {/* Security Actions removed. Account management is now on the profile page. */}

          {/* Data Management */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </h3>

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => alert("Data export starting...")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-error hover:text-error bg-transparent"
              onClick={() => alert("Account deletion requires confirmation")}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
