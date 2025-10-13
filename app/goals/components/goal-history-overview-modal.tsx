"use client";

import { Archive, CheckCircle, Target, Trash2, TrendingUp } from "lucide-react";
import type { Goal } from "@/app/data/data";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface GoalHistoryOverviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function GoalHistoryOverviewModal({
	open,
	onOpenChange,
}: GoalHistoryOverviewModalProps) {
	const goals = useStore((state) => state.goals);
	const updateGoal = useStore((state) => state.updateGoal);
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();

	const formatDate = (date?: string | Date | null) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getProgressPercentage = (goal: Goal) => {
		if (!user) return 0;

		if (goal.type === "weight" && user.currentWeight && user.goalWeight) {
			const currentWeight = user.currentWeight;
			const targetWeight = goal.target;
			const startWeight = goal.current; // This represents the starting weight

			if (user.goalType === "lose") {
				// For weight loss: progress = (starting - current) / (starting - goal)
				const totalToLose = startWeight - targetWeight;
				const lostSoFar = startWeight - currentWeight;
				if (totalToLose > 0) {
					return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
				}
			} else if (user.goalType === "gain") {
				// For weight gain: progress = (current - starting) / (goal - starting)
				const totalToGain = targetWeight - startWeight;
				const gainedSoFar = currentWeight - startWeight;
				if (totalToGain > 0) {
					return Math.min(100, Math.max(0, (gainedSoFar / totalToGain) * 100));
				}
			}
		}

		// For other goals, use current/target ratio
		return Math.min((goal.current / goal.target) * 100, 100);
	};

	const formatGoalValue = (goal: Goal, value: number) => {
		if (!user) return `${value.toFixed(1)} ${goal.unit}`;

		if (goal.type === "weight") {
			const unit = user.units || "imperial";
			const displayValue = getDisplayWeight(value, unit);
			return displayValue
				? `${displayValue.toFixed(1)} ${unit === "imperial" ? "lbs" : "kg"}`
				: "N/A";
		}
		return `${value.toFixed(1)} ${goal.unit}`;
	};

	const handleArchiveGoal = async (goalId: string) => {
		try {
			const response = await fetch("/api/goals", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: goalId,
					isArchived: true,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				updateGoal(goalId, data.goal);
			} else {
				console.error("Failed to archive goal");
			}
		} catch (error) {
			console.error("Error archiving goal:", error);
		}
	};

	const handleDeleteGoal = async (goalId: string) => {
		if (
			!confirm(
				"Are you sure you want to permanently delete this goal? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/goals?id=${goalId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				// Remove from local store
				updateGoal(goalId, { isActive: false, isArchived: true });
			} else {
				console.error("Failed to delete goal");
			}
		} catch (error) {
			console.error("Error deleting goal:", error);
		}
	};

	const allGoals = goals.filter((goal) => goal.completedAt);
	const activeGoals = goals.filter(
		(goal) => goal.isActive && !goal.completedAt,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5" />
						Goal History & Progress
					</DialogTitle>
					<DialogDescription>
						View all your goals, track progress, and manage completed goals.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Active Goals Section */}
					{activeGoals.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<Target className="w-4 h-4" />
								Active Goals ({activeGoals.length})
							</h3>
							<div className="space-y-4">
								{activeGoals.map((goal) => {
									const progress = getProgressPercentage(goal);
									return (
										<div
											key={goal.id}
											className="p-4 border rounded-lg bg-muted/20"
										>
											<div className="flex items-start justify-between mb-3">
												<div>
													<h4 className="font-medium">{goal.name}</h4>
													<p className="text-sm text-muted-foreground capitalize">
														{goal.type} Goal
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-medium">
														{formatGoalValue(goal, goal.current)} /{" "}
														{formatGoalValue(goal, goal.target)}
													</p>
													<p className="text-xs text-muted-foreground">
														{progress.toFixed(1)}% complete
													</p>
												</div>
											</div>
											<Progress value={progress} className="mb-3" />
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<span>
													Started:{" "}
													{formatDate(goal.startDate || goal.createdAt)}
												</span>
												{goal.deadline && (
													<span>Due: {formatDate(goal.deadline)}</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Completed Goals Section */}
					{allGoals.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<CheckCircle className="w-4 h-4" />
								Completed Goals ({allGoals.length})
							</h3>
							<div className="space-y-4">
								{allGoals.map((goal) => {
									const progress = getProgressPercentage(goal);
									const isCompleted = goal.completedAt;
									const isArchived = goal.isArchived;

									return (
										<div
											key={goal.id}
											className={`p-4 border rounded-lg ${
												isArchived ? "bg-muted/10 opacity-60" : "bg-green-50/50"
											}`}
										>
											<div className="flex items-start justify-between mb-3">
												<div>
													<h4 className="font-medium flex items-center gap-2">
														{goal.name}
														{isArchived && (
															<Archive className="w-4 h-4 text-muted-foreground" />
														)}
													</h4>
													<p className="text-sm text-muted-foreground capitalize">
														{goal.type} Goal {isCompleted && "• Completed"}
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-medium">
														{formatGoalValue(goal, goal.current)} /{" "}
														{formatGoalValue(goal, goal.target)}
													</p>
													<p className="text-xs text-muted-foreground">
														{progress.toFixed(1)}% complete
													</p>
												</div>
											</div>
											<Progress value={progress} className="mb-3" />
											<div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
												<span>
													Started:{" "}
													{formatDate(goal.startDate || goal.createdAt)}
												</span>
												{isCompleted && (
													<span>Completed: {formatDate(goal.completedAt)}</span>
												)}
												{goal.deadline && (
													<span>Due: {formatDate(goal.deadline)}</span>
												)}
											</div>
											{isCompleted && !isArchived && (
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleArchiveGoal(goal.id)}
														className="flex items-center gap-2"
													>
														<Archive className="w-3 h-3" />
														Archive
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleDeleteGoal(goal.id)}
														className="flex items-center gap-2"
													>
														<Trash2 className="w-3 h-3" />
														Delete
													</Button>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{activeGoals.length === 0 && allGoals.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							<Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>No goals found. Create your first goal to get started!</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
