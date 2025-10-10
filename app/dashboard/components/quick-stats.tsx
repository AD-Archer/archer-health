"use client";

import { Activity, Droplet, Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface UserProfile {
	id: string;
	clerkId?: string;
	currentWeight: number | null;
	goalWeight: number | null;
	height: number | null;
	age: number | null;
	name: string | null;
	email: string;
	dailyCalorieGoal: number | null;
	macroGoals: any;
	waterGoal: number | null;
	weeklyGoal: number | null;
	goalType: string | null;
	units: string;
}

interface TodaysMeals {
	totalCalories: number;
	mealEntries: any[];
	date: string;
}

interface QuickStatsProps {
	userProfile: UserProfile | null;
	todaysMeals: TodaysMeals | null;
}

export function QuickStats({ userProfile, todaysMeals }: QuickStatsProps) {
	if (!userProfile) {
		return null;
	}

	const { formatWeight } = useUnitConversion();

	const stats = [
		{
			label: "Calories",
			value: todaysMeals ? todaysMeals.totalCalories.toString() : "0",
			target: userProfile.dailyCalorieGoal
				? `${userProfile.dailyCalorieGoal} cal`
				: "Not set",
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-50",
		},
		{
			label: "Water",
			value: "0oz", // TODO: implement water tracking
			target: userProfile.waterGoal ? `${userProfile.waterGoal}oz` : "Not set",
			icon: Droplet,
			color: "text-blue-500",
			bgColor: "bg-blue-50",
		},
		{
			label: "Protein",
			value: "0g", // TODO: calculate from meals
			target: userProfile.macroGoals?.protein
				? `${userProfile.macroGoals.protein}g`
				: "Not set",
			icon: Activity,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			label: "Weight",
			value: userProfile.currentWeight
				? formatWeight(userProfile.currentWeight, userProfile.units)
				: "Not set",
			target: userProfile.goalWeight
				? formatWeight(userProfile.goalWeight, userProfile.units)
				: "Not set",
			icon: Target,
			color: "text-purple-500",
			bgColor: "bg-purple-50",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{stats.map((stat) => (
				<Card key={stat.label} className="p-4">
					<div className="flex items-start justify-between mb-3">
						<div className={`p-2 rounded-lg ${stat.bgColor}`}>
							<stat.icon className={`w-4 h-4 ${stat.color}`} />
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-2xl font-bold font-display">{stat.value}</p>
						<p className="text-xs text-muted-foreground">
							of {stat.target} {stat.label.toLowerCase()}
						</p>
					</div>
				</Card>
			))}
		</div>
	);
}
