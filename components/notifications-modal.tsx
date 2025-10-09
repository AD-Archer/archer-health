"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle2, Info, TrendingUp } from "lucide-react"

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const notifications = [
    {
      id: 1,
      type: "achievement",
      icon: CheckCircle2,
      title: "Goal Achieved!",
      message: "You've reached your daily calorie goal",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "reminder",
      icon: Bell,
      title: "Water Reminder",
      message: "Don't forget to log your water intake",
      time: "4 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "progress",
      icon: TrendingUp,
      title: "Weekly Progress",
      message: "You've lost 2 lbs this week!",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "info",
      icon: Info,
      title: "New Recipe Available",
      message: "Check out our new healthy dinner recipes",
      time: "2 days ago",
      read: true,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Notifications</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? "bg-background border-border" : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
