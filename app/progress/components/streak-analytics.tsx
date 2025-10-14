"use client";

import { Award, Calendar, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionData } from "@/lib/use-nutrition-data";

export function StreakAnalytics() {
	const { progressData, loading } = useNutritionData();

	const streaks = progressData?.streaks;
	const monthlyStats = progressData?.monthlyStats;

	const streakStats = [
		{
			label: "Current Weight Streak",
			value: streaks?.current || 0,
			icon: Award,
			color: "text-purple-500",
			bgColor: "bg-purple-50",
			description: "Consecutive days logging weight",
		},
		{
			label: "Longest Weight Streak",
			value: streaks?.longest || 0,
			icon: Target,
			color: "text-blue-500",
			bgColor: "bg-blue-50",
			description: "Your best weight logging streak",
		},
		{
			label: "Current Meal Streak",
			value: streaks?.currentMeal || 0,
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-50",
			description: "Consecutive days logging meals",
		},
		{
			label: "Longest Meal Streak",
			value: streaks?.longestMeal || 0,
			icon: Calendar,
			color: "text-green-500",
			bgColor: "bg-green-50",
			description: "Your best meal logging streak",
		},
	];

	const consistencyRate = monthlyStats?.daysLogged
		? Math.round((monthlyStats.daysLogged / 30) * 100)
		: 0;

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="font-display flex items-center gap-2">
						<Award className="w-5 h-5" />
						Streaks & Consistency
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4 text-muted-foreground">
						Loading streak data...
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display flex items-center gap-2">
					<Award className="w-5 h-5" />
					Streaks & Consistency
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Streak Stats */}
				<div className="grid grid-cols-2 gap-4">
					{streakStats.map((stat) => (
						<div key={stat.label} className="text-center space-y-2">
							<div className={`p-3 rounded-lg ${stat.bgColor} w-fit mx-auto`}>
								<stat.icon className={`w-6 h-6 ${stat.color}`} />
							</div>
							<div>
								<p className="text-2xl font-bold font-display">{stat.value}</p>
								<p className="text-xs text-muted-foreground">{stat.label}</p>
								<p className="text-xs text-muted-foreground mt-1">
									{stat.description}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Consistency Stats */}
				<div className="pt-4 border-t space-y-4">
					<div className="text-center">
						<h4 className="font-medium mb-2">Monthly Consistency</h4>
						<div className="text-3xl font-bold text-primary mb-1">
							{consistencyRate}%
						</div>
						<p className="text-sm text-muted-foreground">
							{monthlyStats?.daysLogged || 0} days logged this month
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4 text-center">
						<div>
							<p className="text-lg font-semibold">
								{progressData?.totalMealsLogged || 0}
							</p>
							<p className="text-xs text-muted-foreground">
								Total Meals Logged
							</p>
						</div>
						<div>
							<p className="text-lg font-semibold">
								{progressData?.totalDaysTracked || 0}
							</p>
							<p className="text-xs text-muted-foreground">Days Tracked</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
