import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { GoalsHeader } from "./components/goals-header"
import { WeightGoal } from "./components/weight-goal"
import { MacroGoals } from "./components/macro-goals"
import { ActivityGoals } from "./components/activity-goals"
import { Achievements } from "./components/achievements"

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopNav />

      <main className="container py-6 pb-24 md:pb-6 space-y-6">
        <GoalsHeader />
        <WeightGoal />
        <MacroGoals />
        <ActivityGoals />
        <Achievements />
      </main>

      <MobileNav />
    </div>
  )
}
