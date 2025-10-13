"use client";

import { Clock, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface UserProfile {
	id: string;
	clerkId?: string;
	currentWeight: number | null;
	goalWeight: number | null;
	startingWeight: number | null;
	height: number | null;
	age: number | null;
	name: string | null;
	email: string;
	dailyCalorieGoal: number | null;
	macroGoals: {
		protein: number;
		carbs: number;
		fat: number;
	};
	waterGoal: number | null;
	weeklyGoal: number | null;
	goalType: string | null;
	units: string;
}

interface TargetProgressCardProps {
	userProfile: UserProfile | null;
}

export function TargetProgressCard({ userProfile }: TargetProgressCardProps) {
	const { formatWeight, getDisplayWeeklyGoal } = useUnitConversion();

	// Show placeholder if essential data is missing
	if (!userProfile) {
		return (
			<Card className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
				<CardHeader className="pb-2">
					<CardTitle className="font-display flex items-center gap-2">
						<Target className="w-5 h-5 text-primary" />
						Goal Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center text-muted-foreground py-8">
						Loading profile data...
					</div>
				</CardContent>
			</Card>
		);
	}

	const {
		currentWeight,
		goalWeight,
		startingWeight,
		weeklyGoal,
		goalType,
		units,
	} = userProfile;

	// Show setup message if essential data is missing
	if (!currentWeight || !goalWeight) {
		return (
			<Card className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
				<CardHeader className="pb-2">
					<CardTitle className="font-display flex items-center gap-2">
						<Target className="w-5 h-5 text-primary" />
						Goal Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center text-muted-foreground py-8">
						<div className="space-y-2">
							<p className="text-sm">
								Complete your profile to see goal progress
							</p>
							{!currentWeight && (
								<p className="text-xs">• Set your current weight</p>
							)}
							{!goalWeight && <p className="text-xs">• Set your goal weight</p>}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show motivational message if weekly goal is not set
	if (!weeklyGoal || weeklyGoal <= 0) {
		const remainingWeight =
			goalType === "lose"
				? Math.max(0, currentWeight - goalWeight)
				: goalType === "gain"
					? Math.max(0, goalWeight - currentWeight)
					: 0;

		return (
			<Card className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
				<CardHeader className="pb-2">
					<CardTitle className="font-display flex items-center gap-2">
						<Target className="w-5 h-5 text-primary" />
						Goal Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Progress Bar - placeholder */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Progress</span>
							<span className="font-medium">Set weekly goal</span>
						</div>
						<Progress value={0} className="h-2" />
					</div>

					{/* Weight Status */}
					<div className="text-center space-y-1">
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							{goalType === "lose" ? (
								<TrendingDown className="w-4 h-4 text-red-500" />
							) : goalType === "gain" ? (
								<TrendingUp className="w-4 h-4 text-green-500" />
							) : null}
							<span>
								{remainingWeight > 0
									? `${formatWeight(remainingWeight, units)} ${goalType === "lose" ? "to lose" : goalType === "gain" ? "to gain" : "remaining"}`
									: "Goal achieved! 🎉"}
							</span>
						</div>
					</div>

					{/* Motivational Message */}
					<div className="text-center space-y-1">
						<div className="text-lg font-semibold text-primary">
							Set your weekly goal to see progress timeline!
						</div>
					</div>

					{/* Current vs Goal */}
					<div className="grid grid-cols-2 gap-4 pt-2">
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">
								{formatWeight(currentWeight, units)}
							</div>
							<div className="text-xs text-muted-foreground">Current</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-muted-foreground">
								{formatWeight(goalWeight, units)}
							</div>
							<div className="text-xs text-muted-foreground">Goal</div>
						</div>
					</div>

					{/* Motivational quote */}
					<div className="text-center pt-2">
						<p className="text-sm text-muted-foreground italic">
							{goalType === "lose"
								? "Every step forward is a victory. Keep pushing!"
								: goalType === "gain"
									? "Building strength takes time. Stay consistent!"
									: "Consistency is the key to maintaining your results!"}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}
	userProfile;

	// Calculate progress
	const effectiveStartingWeight = startingWeight || currentWeight;
	const totalWeightChange = Math.abs(goalWeight - effectiveStartingWeight);
	const remainingWeight =
		goalType === "lose"
			? Math.max(0, currentWeight - goalWeight)
			: goalType === "gain"
				? Math.max(0, goalWeight - currentWeight)
				: 0;

	const progressPercentage =
		totalWeightChange > 0
			? ((totalWeightChange - remainingWeight) / totalWeightChange) * 100
			: 100;

	// Calculate time remaining
	const weeksRemaining =
		remainingWeight > 0 && weeklyGoal > 0 ? remainingWeight / weeklyGoal : 0;
	const daysRemaining = Math.ceil(weeksRemaining * 7);

	// Format time remaining
	const formatTimeRemaining = (days: number) => {
		if (days === 0) return "Goal reached!";
		if (days < 7) return `${days} day${days === 1 ? "" : "s"}`;
		if (days < 30) {
			const weeks = Math.floor(days / 7);
			const remainingDays = days % 7;
			return remainingDays > 0
				? `${weeks} week${weeks === 1 ? "" : "s"} ${remainingDays} day${remainingDays === 1 ? "" : "s"}`
				: `${weeks} week${weeks === 1 ? "" : "s"}`;
		}
		const months = Math.floor(days / 30);
		const remainingDays = days % 30;
		return remainingDays > 0
			? `${months} month${months === 1 ? "" : "s"} ${remainingDays} day${remainingDays === 1 ? "" : "s"}`
			: `${months} month${months === 1 ? "" : "s"}`;
	};

	const isLosing = goalType === "lose";
	const isGaining = goalType === "gain";

	return (
		<Card className="relative overflow-hidden">
			<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
			<CardHeader className="pb-2">
				<CardTitle className="font-display flex items-center gap-2">
					<Target className="w-5 h-5 text-primary" />
					Goal Progress
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Progress</span>
						<span className="font-medium">
							{Math.round(progressPercentage)}%
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2" />
				</div>

				{/* Weight Status */}
				<div className="text-center space-y-1">
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						{isLosing ? (
							<TrendingDown className="w-4 h-4 text-red-500" />
						) : isGaining ? (
							<TrendingUp className="w-4 h-4 text-green-500" />
						) : null}
						<span>
							{remainingWeight > 0
								? `${formatWeight(remainingWeight, units)} ${isLosing ? "to lose" : isGaining ? "to gain" : "remaining"}`
								: "Goal achieved! 🎉"}
						</span>
					</div>
				</div>

				{/* Time Remaining */}
				{remainingWeight > 0 && (
					<div className="text-center space-y-1">
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<Clock className="w-4 h-4" />
							<span>Estimated time remaining</span>
						</div>
						<div className="text-lg font-semibold text-primary">
							{weeklyGoal > 0
								? formatTimeRemaining(daysRemaining)
								: "Set weekly goal"}
						</div>
						<div className="text-xs text-muted-foreground">
							at{" "}
							{weeklyGoal > 0
								? `${getDisplayWeeklyGoal(weeklyGoal, units)} ${units === "imperial" ? "lbs" : "kg"}`
								: "0"}
							/week
						</div>
					</div>
				)}

				{/* Current vs Goal */}
				<div className="grid grid-cols-2 gap-4 pt-2">
					<div className="text-center">
						<div className="text-2xl font-bold text-primary">
							{formatWeight(currentWeight, units)}
						</div>
						<div className="text-xs text-muted-foreground">Current</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-muted-foreground">
							{formatWeight(goalWeight, units)}
						</div>
						<div className="text-xs text-muted-foreground">Goal</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
