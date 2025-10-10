"use client";

import { Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
	macroGoals: {
		protein: number;
		carbs: number;
		fat: number;
	} | null;
	waterGoal: number | null;
	weeklyGoal: number | null;
	goalType: string | null;
	units: string;
}

interface TodaysMacros {
	macros: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
	};
	nutrients: {
		vitaminC: number;
		calcium: number;
		iron: number;
		fiber: number;
	};
	date: string;
}

interface MacrosCardProps {
	userProfile: UserProfile | null;
	todaysMacros: TodaysMacros | null;
}

export function MacrosCard({ userProfile, todaysMacros }: MacrosCardProps) {
	// Use real data from API or fallback to zeros
	const currentMacros = todaysMacros?.macros || {
		protein: 0,
		carbs: 0,
		fat: 0,
	};

	const macroGoals = userProfile?.macroGoals;

	const macros = [
		{
			name: "Protein",
			current: currentMacros.protein,
			target: macroGoals?.protein || 0,
			unit: "g",
			color: "bg-red-500",
		},
		{
			name: "Carbs",
			current: currentMacros.carbs,
			target: macroGoals?.carbs || 0,
			unit: "g",
			color: "bg-blue-500",
		},
		{
			name: "Fat",
			current: currentMacros.fat,
			target: macroGoals?.fat || 0,
			unit: "g",
			color: "bg-yellow-500",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display flex items-center gap-2">
					<Utensils className="w-5 h-5 text-primary" />
					Daily Macros
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{macros.map((macro) => (
					<div key={macro.name} className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{macro.name}</span>
							<span className="text-muted-foreground">
								{macro.current} / {macro.target} {macro.unit}
							</span>
						</div>
						<Progress
							value={
								macro.target > 0 ? (macro.current / macro.target) * 100 : 0
							}
							className="h-2"
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
