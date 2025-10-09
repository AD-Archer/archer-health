import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { DashboardHeader } from "./components/dashboard-header"
import { ProgressChart } from "./components/progress-chart"
import { QuickStats } from "./components/quick-stats"
import { WorkoutLog } from "./components/workout-log"
import { MealSummary } from "./components/meal-summary"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopNav />

      <main className="container py-6 pb-24 md:pb-6 space-y-6">
        <DashboardHeader />
        <QuickStats />
        <ProgressChart />
        <div className="grid gap-6 md:grid-cols-2">
          <WorkoutLog />
          <MealSummary />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
