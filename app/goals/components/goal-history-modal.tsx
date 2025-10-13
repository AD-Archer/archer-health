"use client";

import {
	Archive,
	Calendar,
	Clock,
	Target,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { Goal } from "@/app/data/data";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface GoalHistoryModalProps {
	goal: Goal;
	trigger: React.ReactNode;
	onArchive?: (goalId: string) => void;
	onDelete?: (goalId: string) => void;
}

export function GoalHistoryModal({
	goal,
	trigger,
	onArchive,
	onDelete,
}: GoalHistoryModalProps) {
	const [open, setOpen] = useState(false);
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();

	const formatDate = (dateString: string | Date) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getProgressPercentage = () => {
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

	const formatGoalValue = (value: number) => {
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

	const progress = getProgressPercentage();
	const isCompleted = !goal.isActive && goal.completedAt;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Target className="w-5 h-5" />
						{goal.name}
					</DialogTitle>
					<DialogDescription>
						Goal history and progress details
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Goal Status */}
					<div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
						<div className="flex items-center gap-2">
							{isCompleted ? (
								<div className="flex items-center gap-2 text-green-600">
									<div className="w-2 h-2 bg-green-600 rounded-full"></div>
									<span className="font-medium">Completed</span>
								</div>
							) : goal.isActive ? (
								<div className="flex items-center gap-2 text-blue-600">
									<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
									<span className="font-medium">In Progress</span>
								</div>
							) : (
								<div className="flex items-center gap-2 text-gray-600">
									<div className="w-2 h-2 bg-gray-600 rounded-full"></div>
									<span className="font-medium">Inactive</span>
								</div>
							)}
						</div>
						{goal.isArchived && (
							<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
								Archived
							</span>
						)}
					</div>

					{/* Progress */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Progress</span>
							<span>{progress.toFixed(1)}%</span>
						</div>
						<Progress value={progress} className="h-3" />
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>{formatGoalValue(goal.current)}</span>
							<span>{formatGoalValue(goal.target)}</span>
						</div>
					</div>

					{/* Timeline */}
					<div className="space-y-4">
						<h4 className="font-medium flex items-center gap-2">
							<Clock className="w-4 h-4" />
							Timeline
						</h4>

						<div className="space-y-3">
							{/* Start Date */}
							<div className="flex items-center gap-3 p-3 rounded-lg border">
								<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
									<Calendar className="w-4 h-4 text-blue-600" />
								</div>
								<div>
									<p className="font-medium">Goal Started</p>
									<p className="text-sm text-muted-foreground">
										{goal.startDate
											? formatDate(goal.startDate)
											: goal.createdAt
												? formatDate(goal.createdAt)
												: "N/A"}
									</p>
								</div>
							</div>

							{/* Completion Date */}
							{isCompleted && goal.completedAt && (
								<div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
									<div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
										<TrendingUp className="w-4 h-4 text-green-600" />
									</div>
									<div>
										<p className="font-medium text-green-700 dark:text-green-400">
											Goal Completed
										</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(goal.completedAt)}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Goal Details */}
					<div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
						<div>
							<p className="text-sm text-muted-foreground">Type</p>
							<p className="font-medium capitalize">{goal.type}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Target</p>
							<p className="font-medium">{formatGoalValue(goal.target)}</p>
						</div>
						{goal.deadline && (
							<div>
								<p className="text-sm text-muted-foreground">Deadline</p>
								<p className="font-medium">{formatDate(goal.deadline)}</p>
							</div>
						)}
						<div>
							<p className="text-sm text-muted-foreground">Last Updated</p>
							<p className="font-medium">
								{goal.updatedAt ? formatDate(goal.updatedAt) : "N/A"}
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="flex gap-2">
					{isCompleted && !goal.isArchived && (
						<Button
							variant="outline"
							onClick={() => onArchive?.(goal.id)}
							className="flex items-center gap-2"
						>
							<Archive className="w-4 h-4" />
							Archive
						</Button>
					)}
					{isCompleted && (
						<Button
							variant="destructive"
							onClick={() => onDelete?.(goal.id)}
							className="flex items-center gap-2"
						>
							<Trash2 className="w-4 h-4" />
							Delete
						</Button>
					)}
					<Button onClick={() => setOpen(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
