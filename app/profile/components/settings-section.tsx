"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Bell, Lock, HelpCircle, LogOut, Shield, FileText } from "lucide-react"
import Link from "next/link"
import { NotificationSettingsModal } from "@/components/notification-settings-modal"
import { PrivacySecurityModal } from "@/components/privacy-security-modal"
import { HelpModal } from "@/components/help-modal"

export function SettingsSection() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      // In a real app, this would clear auth tokens and redirect
      window.location.href = "/login"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            onClick={() => setNotificationsOpen(true)}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => setPrivacyOpen(true)}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <Link
            href="/terms"
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Terms of Service</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full text-error"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <NotificationSettingsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <PrivacySecurityModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
