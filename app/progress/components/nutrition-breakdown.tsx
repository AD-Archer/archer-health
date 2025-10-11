"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

interface ProgressData {
	todayNutrition: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
		mealsLogged: number;
	};
	averages: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
	};
}

export function NutritionBreakdown() {
	const user = useStore((state) => state.user);
	const [progressData, setProgressData] = useState<ProgressData | null>(null);

	useEffect(() => {
		const fetchProgress = async () => {
			try {
				const response = await fetch("/api/progress");
				if (response.ok) {
					const data = await response.json();
					setProgressData(data);
				}
			} catch (error) {
				console.error("Error fetching progress data:", error);
			}
		};

		fetchProgress();
	}, []);

	const todayNutrition = progressData?.todayNutrition;
	const averages = progressData?.averages;

	// Use macro goals from user if available, otherwise use reasonable defaults
	const macroGoals = user.macroGoals as {
		protein?: number;
		carbs?: number;
		fat?: number;
	} | null;
	const proteinGoal = macroGoals?.protein || 120;
	const carbGoal = macroGoals?.carbs || 180;
	const fatGoal = macroGoals?.fat || 55;

	const macros = [
		{
			name: "Protein",
			today: todayNutrition?.protein || 0,
			target: proteinGoal,
			average: averages?.protein || 0,
			color: "bg-primary",
			percentage: Math.min(
				((todayNutrition?.protein || 0) / proteinGoal) * 100,
				100,
			),
		},
		{
			name: "Carbs",
			today: todayNutrition?.carbs || 0,
			target: carbGoal,
			average: averages?.carbs || 0,
			color: "bg-blue-500",
			percentage: Math.min(
				((todayNutrition?.carbs || 0) / carbGoal) * 100,
				100,
			),
		},
		{
			name: "Fat",
			today: todayNutrition?.fat || 0,
			target: fatGoal,
			average: averages?.fat || 0,
			color: "bg-orange-500",
			percentage: Math.min(((todayNutrition?.fat || 0) / fatGoal) * 100, 100),
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-display">Today's Nutrition</CardTitle>
					<div className="text-sm text-muted-foreground">
						{todayNutrition?.mealsLogged || 0} meals logged
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{macros.map((macro) => (
					<div key={macro.name} className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-medium">{macro.name}</span>
							<span className="text-sm text-muted-foreground">
								{macro.today.toFixed(0)}g / {macro.target}g
							</span>
						</div>
						<Progress value={macro.percentage} className="h-3" />
						<div className="text-xs text-muted-foreground">
							Daily avg: {macro.average.toFixed(0)}g
						</div>
					</div>
				))}
				<div className="pt-4 border-t">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Total Calories</span>
						<span className="text-muted-foreground">
							{todayNutrition?.calories || 0} / {user.dailyCalorieGoal || 2000}
						</span>
					</div>
					<Progress
						value={Math.min(
							((todayNutrition?.calories || 0) /
								(user.dailyCalorieGoal || 2000)) *
								100,
							100,
						)}
						className="h-2 mt-2"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
