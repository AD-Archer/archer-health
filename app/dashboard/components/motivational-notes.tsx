"use client";

import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface MotivationalNotesProps {
	userProfile: UserProfile | null;
}

export function MotivationalNotes({ userProfile }: MotivationalNotesProps) {
	const { getDisplayWeight, getDisplayWeeklyGoal } = useUnitConversion();

	if (
		!userProfile?.currentWeight ||
		!userProfile?.goalWeight ||
		!userProfile?.goalType ||
		(userProfile?.goalType !== "maintain" && !userProfile?.weeklyGoal)
	) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Your Journey
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						What matters most isn't the scale—it's how you feel about your body.
						Every step forward, no matter how small, is progress worth
						celebrating. You've got this! 💪
					</p>
				</CardContent>
			</Card>
		);
	}

	const currentWeight = userProfile.currentWeight;
	const goalWeight = userProfile.goalWeight;
	const weeklyGoal = userProfile.weeklyGoal;
	const goalType = userProfile.goalType;
	const units = userProfile.units;

	// Convert to display units using the hook
	const displayCurrentWeight = getDisplayWeight(currentWeight, units) || 0;
	const displayGoalWeight = getDisplayWeight(goalWeight, units) || 0;
	const displayWeeklyGoal = getDisplayWeeklyGoal(weeklyGoal, units) || 0;

	// Determine if user is losing or gaining weight based on goalType
	const isLosingWeight = goalType === "lose";
	const isGainingWeight = goalType === "gain";
	const isMaintaining = goalType === "maintain";

	// Calculate weight change projections
	const weightDifference = Math.abs(displayGoalWeight - displayCurrentWeight);
	const weeksToGoal =
		isMaintaining || displayWeeklyGoal <= 0
			? 0
			: Math.ceil(weightDifference / displayWeeklyGoal);

	// Future projections
	let in5Weeks = displayCurrentWeight;
	let in10Weeks = displayCurrentWeight;

	if (displayWeeklyGoal > 0) {
		if (isLosingWeight) {
			in5Weeks = displayCurrentWeight - displayWeeklyGoal * 5;
			in10Weeks = displayCurrentWeight - displayWeeklyGoal * 10;
		} else if (isGainingWeight) {
			in5Weeks = displayCurrentWeight + displayWeeklyGoal * 5;
			in10Weeks = displayCurrentWeight + displayWeeklyGoal * 10;
		}
	}

	const remainingToGoal = isLosingWeight
		? displayCurrentWeight - displayGoalWeight
		: isGainingWeight
			? displayGoalWeight - displayCurrentWeight
			: 0;

	const unitLabel = units === "metric" ? "kg" : "lbs";
	const TrendIcon = isLosingWeight
		? TrendingDown
		: isGainingWeight
			? TrendingUp
			: Target;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display flex items-center gap-2">
					<Target className="w-5 h-5 text-primary" />
					Your Journey
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-center">
					<p className="text-lg font-medium mb-2">
						{weightDifference === 0
							? "You've reached your goal!"
							: isMaintaining
								? "Maintaining your weight!"
								: weeksToGoal > 0
									? `${weeksToGoal} weeks to reach your goal!`
									: "Set your weekly goal to see progress timeline!"}
					</p>
					<p className="text-sm text-muted-foreground mb-4">
						{remainingToGoal > 0
							? `${Math.round(remainingToGoal)} ${unitLabel} to go`
							: isMaintaining
								? "Stay consistent!"
								: "Keep up the great work!"}
					</p>
				</div>

				{!isMaintaining && displayWeeklyGoal > 0 && (
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
							<div className="flex items-center gap-2">
								<TrendIcon className="w-4 h-4 text-primary" />
								<span className="text-sm font-medium">In 5 weeks</span>
							</div>
							<span className="text-sm font-bold text-primary">
								{Math.round(in5Weeks)} {unitLabel}
							</span>
						</div>

						<div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
							<div className="flex items-center gap-2">
								<TrendIcon className="w-4 h-4 text-primary" />
								<span className="text-sm font-medium">In 10 weeks</span>
							</div>
							<span className="text-sm font-bold text-primary">
								{Math.round(in10Weeks)} {unitLabel}
							</span>
						</div>
					</div>
				)}

				<div className="text-center pt-2">
					<p className="text-sm text-muted-foreground italic">
						{isLosingWeight
							? "Every step forward is a victory. Keep pushing!"
							: isGainingWeight
								? "Building strength takes time. Stay consistent!"
								: "Consistency is the key to maintaining your results!"}
					</p>
				</div>

				<div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
							<span className="text-primary text-sm">💝</span>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-primary">
								Remember: Progress is about more than the scale
							</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								What matters most isn't the number on the scale—it's how you
								feel about your body and the strength you're building. Take
								progress pictures, celebrate non-scale victories, and focus on
								how your clothes fit and your energy levels. Your worth isn't
								measured in pounds, but in the healthy choices you make every
								day.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
