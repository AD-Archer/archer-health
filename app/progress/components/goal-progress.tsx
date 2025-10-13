"use client";

import { Calendar, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface Goal {
	id: string;
	type: string;
	name: string;
	target: number;
	current: number;
	unit: string;
	deadline?: string;
	isActive: boolean;
}

export function GoalProgress() {
	const user = useStore((state) => state.user);
	const goals = useStore((state) => state.goals);
	const { getDisplayWeight } = useUnitConversion();

	const getGoalProgress = (goal: Goal) => {
		if (goal.type === "weight") {
			// For weight goals, calculate progress based on current weight vs target
			const currentWeight = user?.currentWeight || 0;
			const targetWeight = goal.target;
			const startWeight = goal.current; // This might be the starting weight

			if (targetWeight > startWeight) {
				// Gaining weight
				const progress =
					((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
				return Math.min(Math.max(progress, 0), 100);
			} else {
				// Losing weight
				const progress =
					((startWeight - currentWeight) / (startWeight - targetWeight)) * 100;
				return Math.min(Math.max(progress, 0), 100);
			}
		}

		// For other goals, use the current value directly
		return Math.min((goal.current / goal.target) * 100, 100);
	};

	const getDaysRemaining = (deadline?: string) => {
		if (!deadline) return null;
		const now = new Date();
		const deadlineDate = new Date(deadline);
		const diffTime = deadlineDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const formatGoalValue = (goal: Goal) => {
		if (goal.type === "weight") {
			const unit = user?.units || "imperial";
			const currentDisplay = getDisplayWeight(goal.current, unit);
			const targetDisplay = getDisplayWeight(goal.target, unit);
			if (currentDisplay === null || targetDisplay === null)
				return "Invalid data";
			return `${currentDisplay.toFixed(1)} / ${targetDisplay.toFixed(1)} ${unit === "imperial" ? "lbs" : "kg"}`;
		}
		return `${goal.current.toFixed(1)} / ${goal.target} ${goal.unit}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display flex items-center gap-2">
					<Target className="w-5 h-5" />
					Goal Progress
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{goals && goals.length > 0 ? (
					goals
						.filter((goal) => goal.isActive)
						.map((goal) => {
							const progress = getGoalProgress(goal);
							const daysRemaining = getDaysRemaining(goal.deadline);

							return (
								<div key={goal.id} className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">{goal.name}</h4>
											<p className="text-sm text-muted-foreground">
												{formatGoalValue(goal)}
											</p>
										</div>
										{daysRemaining !== null && (
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="w-3 h-3" />
												{daysRemaining} days left
											</div>
										)}
									</div>
									<Progress value={progress} className="h-3" />
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>{progress.toFixed(1)}% complete</span>
										{progress >= 100 && (
											<span className="text-green-600 font-medium flex items-center gap-1">
												<TrendingUp className="w-3 h-3" />
												Goal achieved!
											</span>
										)}
									</div>
								</div>
							);
						})
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>No active goals</p>
						<p className="text-sm">
							Set goals in your profile to track progress
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
