import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ProgressHeader } from "./components/progress-header"
import { WeightChart } from "./components/weight-chart"
import { NutritionBreakdown } from "./components/nutrition-breakdown"
import { WeeklyStats } from "./components/weekly-stats"

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopNav />

      <main className="container py-6 pb-24 md:pb-6 space-y-6">
        <ProgressHeader />
        <WeightChart />
        <div className="grid gap-6 md:grid-cols-2">
          <NutritionBreakdown />
          <WeeklyStats />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
