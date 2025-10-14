"use client";

import { Activity, Award, Flame, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useNutritionData } from "@/lib/use-nutrition-data";
import { useUnitConversion } from "@/lib/use-unit-conversion";

export function WeeklyStats() {
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();
	const { progressData, loading } = useNutritionData();

	// Calculate weight lost this week
	const getWeightLost = () => {
		if (!progressData?.weightHistory || progressData.weightHistory.length < 2) {
			return 0;
		}

		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const recentEntries = progressData.weightHistory.filter(
			(entry) => new Date(entry.date) >= oneWeekAgo,
		);

		if (recentEntries.length < 2) return 0;

		const firstWeight = recentEntries[0].weight;
		const lastWeight = recentEntries[recentEntries.length - 1].weight;

		return firstWeight - lastWeight;
	};

	const weightLost = getWeightLost();
	const displayWeightLost = Math.abs(
		getDisplayWeight(weightLost, user?.units || "imperial") || 0,
	);
	const weightLostText =
		weightLost > 0
			? `-${displayWeightLost.toFixed(1)}`
			: weightLost < 0
				? `+${displayWeightLost.toFixed(1)}`
				: "0.0";
	const weightUnit = user?.units === "imperial" ? "lbs" : "kg";

	const averageWeight = progressData?.averages?.weight
		? (
				getDisplayWeight(
					progressData.averages.weight,
					user?.units || "imperial",
				) || 0
			).toFixed(1)
		: "0.0";

	const stats = [
		{
			label: "Weight Change (7d)",
			value: `${weightLostText} ${weightUnit}`,
			icon: TrendingDown,
			color:
				weightLost > 0
					? "text-green-500"
					: weightLost < 0
						? "text-red-500"
						: "text-gray-500",
			bgColor:
				weightLost > 0
					? "bg-green-50"
					: weightLost < 0
						? "bg-red-50"
						: "bg-gray-50",
		},
		{
			label: "Avg Weight",
			value: `${averageWeight} ${weightUnit}`,
			icon: Activity,
			color: "text-blue-500",
			bgColor: "bg-blue-50",
		},
		{
			label: "Avg Daily Calories",
			value: progressData
				? `${Math.round(progressData.averages.calories)}/day`
				: "0/day",
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-50",
		},
		{
			label: "Weight Streak",
			value: `${progressData?.streaks.current || 0} days`,
			icon: Award,
			color: "text-purple-500",
			bgColor: "bg-purple-50",
		},
		{
			label: "Meal Streak",
			value: `${progressData?.streaks.currentMeal || 0} days`,
			icon: Award,
			color: "text-indigo-500",
			bgColor: "bg-indigo-50",
		},
		{
			label: "BMI",
			value: progressData?.bmi ? progressData.bmi.toFixed(1) : "N/A",
			icon: Activity,
			color: "text-teal-500",
			bgColor: "bg-teal-50",
		},
	];

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="font-display">This Week</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4 text-muted-foreground">
						Loading weekly stats...
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display">This Week</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{stats.map((stat) => (
					<div key={stat.label} className="space-y-2">
						<div className={`p-2 rounded-lg ${stat.bgColor} w-fit`}>
							<stat.icon className={`w-5 h-5 ${stat.color}`} />
						</div>
						<div>
							<p className="text-2xl font-bold font-display">{stat.value}</p>
							<p className="text-sm text-muted-foreground">{stat.label}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
