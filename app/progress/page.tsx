import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { CalorieChart } from "./components/calorie-chart";
import { GoalProgress } from "./components/goal-progress";
import { NutritionBreakdown } from "./components/nutrition-breakdown";
import { ProgressHeader } from "./components/progress-header";
import { StreakAnalytics } from "./components/streak-analytics";
import { WeeklyStats } from "./components/weekly-stats";
import { WeightChart } from "./components/weight-chart";

export default function ProgressPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<ProgressHeader />

				{/* Key Metrics */}
				<WeeklyStats />

				{/* Charts Row */}
				<div className="grid gap-6 lg:grid-cols-2">
					<WeightChart />
					<CalorieChart />
				</div>

				{/* Analytics Row */}
				<div className="grid gap-6 lg:grid-cols-3">
					<NutritionBreakdown />
					<GoalProgress />
					<StreakAnalytics />
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
