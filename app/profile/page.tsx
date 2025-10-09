import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ProfileHeader } from "./components/profile-header"
import { ProfileStats } from "./components/profile-stats"
import { SettingsSection } from "./components/settings-section"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopNav />

      <main className="container py-6 pb-24 md:pb-6 space-y-6">
        <ProfileHeader />
        <ProfileStats />
        <SettingsSection />
      </main>

      <MobileNav />
    </div>
  )
}
