"use client";

import { Pill } from "lucide-react";
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
	macroGoals: unknown;
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

interface NutrientsCardProps {
	_userProfile: UserProfile | null;
	todaysMacros: TodaysMacros | null;
}

export function NutrientsCard({
	_userProfile,
	todaysMacros,
}: NutrientsCardProps) {
	// Use real data from API or fallback to zeros
	const currentNutrients = todaysMacros?.nutrients || {
		vitaminC: 0,
		calcium: 0,
		iron: 0,
		fiber: 0,
	};

	// Recommended daily values (example values)
	const nutrientGoals = {
		vitaminC: 90, // mg (RDA for adults)
		calcium: 1000, // mg (RDA for adults)
		iron: 18, // mg (RDA for women, 8 for men - using higher)
		fiber: 25, // g (adequate intake)
	};

	const nutrients = [
		{
			name: "Vitamin C",
			current: currentNutrients.vitaminC,
			target: nutrientGoals.vitaminC,
			unit: "mg",
			color: "bg-green-500",
		},
		{
			name: "Calcium",
			current: currentNutrients.calcium,
			target: nutrientGoals.calcium,
			unit: "mg",
			color: "bg-orange-500",
		},
		{
			name: "Iron",
			current: currentNutrients.iron,
			target: nutrientGoals.iron,
			unit: "mg",
			color: "bg-red-500",
		},
		{
			name: "Fiber",
			current: currentNutrients.fiber,
			target: nutrientGoals.fiber,
			unit: "g",
			color: "bg-purple-500",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display flex items-center gap-2">
					<Pill className="w-5 h-5 text-primary" />
					Key Nutrients
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{nutrients.map((nutrient) => (
					<div key={nutrient.name} className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{nutrient.name}</span>
							<span className="text-muted-foreground">
								{nutrient.current} / {nutrient.target} {nutrient.unit}
							</span>
						</div>
						<Progress
							value={(nutrient.current / nutrient.target) * 100}
							className="h-2"
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
