"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Download } from "lucide-react"
import { useState } from "react"

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

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Privacy & Security</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Security Actions */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h3>

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => alert("Password change functionality coming soon!")}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => alert("2FA setup coming soon!")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          </div>

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
