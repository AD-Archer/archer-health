"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Settings, Bell, HelpCircle, Edit } from "lucide-react"
import { useState } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { NotificationsModal } from "@/components/notifications-modal"
import { HelpModal } from "@/components/help-modal"
import { EditProfileModal } from "@/components/edit-profile-modal"

export function ProfileHeader() {
  const user = useStore((state) => state.user)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-white text-2xl font-display">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-display">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditProfileOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                {!user.isPremium && <Button size="sm">Upgrade to Premium</Button>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsNotificationsOpen(true)}>
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NotificationsModal open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <HelpModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <EditProfileModal open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} />
    </>
  )
}
