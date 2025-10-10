"use client";

import { Scale, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface WeightUpdateCardProps {
	userProfile: UserProfile | null;
	onWeightUpdate: (newWeight: number) => void;
}

export function WeightUpdateCard({
	userProfile,
	onWeightUpdate,
}: WeightUpdateCardProps) {
	const { getDisplayWeight, displayWeightToKg } = useUnitConversion();
	const [weightInput, setWeightInput] = useState(
		getDisplayWeight(
			userProfile?.currentWeight ?? null,
			userProfile?.units || "imperial",
		)?.toString() || "",
	);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		const displayWeight = getDisplayWeight(
			userProfile?.currentWeight ?? null,
			userProfile?.units || "imperial",
		);
		setWeightInput(displayWeight?.toString() || "");
	}, [userProfile?.currentWeight, userProfile?.units, getDisplayWeight]);

	const handleWeightUpdate = async () => {
		const newWeight = parseFloat(weightInput);
		if (Number.isNaN(newWeight) || newWeight <= 0) return;

		setIsUpdating(true);
		try {
			// Convert display weight to kg before sending to API
			const weightInKg = displayWeightToKg(
				newWeight,
				userProfile?.units || "imperial",
			);

			const response = await fetch("/api/update-weight", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ weight: weightInKg }),
			});

			if (response.ok) {
				const data = await response.json();
				onWeightUpdate(data.user.currentWeight); // Use kg value from API response
			} else {
				console.error("Failed to update weight");
			}
		} catch (error) {
			console.error("Error updating weight:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const unitLabel = userProfile?.units === "metric" ? "kg" : "lbs";
	const currentWeight = userProfile?.currentWeight;
	const goalWeight = userProfile?.goalWeight;
	const goalType = userProfile?.goalType;

	// Convert to display units and round to whole numbers
	const displayCurrentWeight = getDisplayWeight(
		currentWeight ?? null,
		userProfile?.units || "imperial",
	);
	const displayGoalWeight = getDisplayWeight(
		goalWeight ?? null,
		userProfile?.units || "imperial",
	);

	// Determine weight direction based on goalType
	const isLosingWeight = goalType === "lose";
	const isGainingWeight = goalType === "gain";
	const isMaintaining = goalType === "maintain";

	const weightDifference =
		displayCurrentWeight && displayGoalWeight
			? Math.abs(displayCurrentWeight - displayGoalWeight)
			: 0;
	const isOnTrack =
		displayGoalWeight && displayCurrentWeight
			? isLosingWeight
				? displayCurrentWeight <= displayGoalWeight + 2
				: isGainingWeight
					? displayCurrentWeight >= displayGoalWeight - 2
					: Math.abs(displayCurrentWeight - displayGoalWeight) <= 1
			: false;

	return (
		<Card className="relative overflow-hidden">
			<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
			<CardHeader className="pb-2">
				<CardTitle className="font-display flex items-center gap-2">
					<Scale className="w-5 h-5 text-primary" />
					Current Weight
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Current Weight Display */}
				<div className="text-center">
					<div className="text-4xl font-bold font-display text-primary mb-1">
						{displayCurrentWeight ?? "--"}
					</div>
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<span>{unitLabel}</span>
						{displayGoalWeight && (
							<>
								<TrendingUp className="w-3 h-3" />
								<span>
									{weightDifference > 0
										? `${weightDifference} ${unitLabel} to goal`
										: "Goal reached!"}
								</span>
							</>
						)}
					</div>
				</div>

				{/* Weight Input */}
				<div className="space-y-3">
					<div className="relative">
						<Input
							type="number"
							step="0.1"
							value={weightInput}
							onChange={(e) => setWeightInput(e.target.value)}
							placeholder={`Enter weight in ${unitLabel}`}
							className="text-center text-lg py-3 h-auto border-2 focus:border-primary/50"
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
							{unitLabel}
						</div>
					</div>
				</div>

				{/* Update Button */}
				<Button
					onClick={handleWeightUpdate}
					disabled={isUpdating || !weightInput || parseFloat(weightInput) <= 0}
					className="w-full py-3 text-base font-medium"
					size="lg"
				>
					{isUpdating ? "Updating..." : "Update Weight"}
				</Button>

				{/* Status Indicator */}
				{displayGoalWeight && displayCurrentWeight && goalType && (
					<div className="text-center">
						<div
							className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
								isOnTrack
									? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
									: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
							}`}
						>
							<div
								className={`w-2 h-2 rounded-full ${isOnTrack ? "bg-green-500" : "bg-orange-500"}`}
							/>
							{isMaintaining
								? "Maintaining"
								: isOnTrack
									? "On Track"
									: isLosingWeight
										? "Keep Losing"
										: "Keep Gaining"}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
