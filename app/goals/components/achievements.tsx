"use client";

import { Edit, History, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Goal } from "@/app/data/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { GoalHistoryOverviewModal } from "./goal-history-overview-modal";
import { GoalModal } from "./goal-modal";

export function Achievements() {
	const goals = useStore((state) => state.goals);
	const updateGoal = useStore((state) => state.updateGoal);
	const [showHistoryModal, setShowHistoryModal] = useState(false);

	const handleToggleActive = (goal: Goal) => {
		updateGoal(goal.id, { isActive: !goal.isActive });
	};

	const handleMarkComplete = async (goal: Goal) => {
		try {
			const response = await fetch("/api/goals", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: goal.id,
					isActive: false, // Mark as inactive when completed
					current: goal.target, // Set current to target to show as complete
				}),
			});

			if (response.ok) {
				const data = await response.json();
				updateGoal(goal.id, data.goal);
			} else {
				console.error("Failed to mark goal complete");
			}
		} catch (error) {
			console.error("Error marking goal complete:", error);
		}
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

	const activeGoals = goals.filter(
		(goal) =>
			(goal.isActive || (goal.completedAt && !goal.isArchived)) &&
			goal.type !== "activity",
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-display">Goals</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{activeGoals.length === 0 ? (
					<p className="text-muted-foreground text-center py-4">
						No active goals yet. Create your first goal!
					</p>
				) : (
					activeGoals.map((goal) => (
						<div
							key={goal.id}
							className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
						>
							<div className="flex-1">
								<p className="font-medium">{goal.name}</p>
								<p className="text-sm text-muted-foreground">
									{goal.current}/{goal.target} {goal.unit}
									{goal.deadline && ` • Due: ${goal.deadline}`}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{!goal.completedAt && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleMarkComplete(goal)}
										className="text-green-600 border-green-600 hover:bg-green-50"
									>
										Complete
									</Button>
								)}
								{goal.completedAt && !goal.isArchived && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleArchiveGoal(goal.id)}
										className="text-blue-600 border-blue-600 hover:bg-blue-50"
									>
										Archive
									</Button>
								)}
								<Switch
									checked={goal.isActive}
									onCheckedChange={() => handleToggleActive(goal)}
								/>
								<GoalModal
									goal={goal}
									trigger={
										<Button variant="ghost" size="sm">
											<Edit className="w-4 h-4" />
										</Button>
									}
								/>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeleteGoal(goal.id)}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
					))
				)}

				<GoalModal
					trigger={
						<Button className="w-full bg-transparent" variant="outline">
							<Plus className="w-4 h-4 mr-2" />
							Add New Goal
						</Button>
					}
				/>

				<Button
					variant="outline"
					className="w-full"
					onClick={() => setShowHistoryModal(true)}
				>
					<History className="w-4 h-4 mr-2" />
					View Goal History
				</Button>

				<GoalHistoryOverviewModal
					open={showHistoryModal}
					onOpenChange={setShowHistoryModal}
				/>
			</CardContent>
		</Card>
	);
}
