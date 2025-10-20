"use client";

// Use Node.js runtime to ensure Node APIs (like fs) are available
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { useStore } from "@/lib/store";
import { useAuthEnabled } from "@/lib/use-auth-enabled";
import { CalorieChart } from "./components/calorie-chart";
import { GoalProgress } from "./components/goal-progress";
import { NutritionBreakdown } from "./components/nutrition-breakdown";
import { ProgressHeader } from "./components/progress-header";

import { StreakAnalytics } from "./components/streak-analytics";
import { WeeklyStats } from "./components/weekly-stats";
import { WeightChart } from "./components/weight-chart";

export default function ProgressPage() {
	const authEnabled = useAuthEnabled();
	const { isLoaded, user } = authEnabled
		? useUser()
		: { isLoaded: authEnabled === null ? false : true, user: null };
	const { setGoals } = useStore();

	if (authEnabled === false) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Authentication Disabled
					</h1>
					<p className="text-gray-600">
						Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable
						authentication.
					</p>
				</div>
			</div>
		);
	}

	useEffect(() => {
		if (isLoaded && user) {
			// Fetch goals
			fetch("/api/goals")
				.then((res) => res.json())
				.then((data) => {
					if (data.goals) {
						setGoals(data.goals);
					}
				})
				.catch((error) => {
					console.error("Error fetching goals:", error);
				});
		}
	}, [isLoaded, user, setGoals]);

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
