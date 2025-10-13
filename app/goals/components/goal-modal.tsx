"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createGoalFromTemplate, goalTemplates } from "@/lib/goal-templates";
import { useStore } from "@/lib/store";

interface GoalModalProps {
	goal?: Goal;
	trigger?: React.ReactNode;
	onSave?: (goal: Goal) => void;
}

export function GoalModal({ goal, trigger, onSave }: GoalModalProps) {
	const [open, setOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");

	const addGoal = useStore((state) => state.addGoal);
	const updateGoal = useStore((state) => state.updateGoal);
	const user = useStore((state) => state.user);
	const updateUser = useStore((state) => state.updateUser);

	const [formData, setFormData] = useState<{
		type: Goal["type"];
		name: string;
		target: number;
		unit: string;
		deadline: string;
		goalType: "lose" | "maintain" | "gain";
		weeklyGoal: string | number;
	}>({
		type: goal?.type || "custom",
		name: goal?.name || "",
		target: goal?.target || 1,
		unit: goal?.unit || "",
		deadline: goal?.deadline || "",
		goalType:
			((goal as Goal & { goalType?: string; weeklyGoal?: number | string })
				?.goalType as "lose" | "maintain" | "gain") ||
			user?.goalType ||
			"maintain",
		weeklyGoal:
			(goal as Goal & { goalType?: string; weeklyGoal?: number | string })
				?.weeklyGoal ||
			user?.weeklyGoal ||
			"",
	});

	const handleTemplateSelect = (templateId: string) => {
		const template = goalTemplates.find((t) => t.id === templateId);
		if (template) {
			const goalData = createGoalFromTemplate(template);
			setFormData({
				type: goalData.type,
				name: goalData.name,
				target: goalData.target,
				unit: goalData.unit,
				deadline: goalData.deadline || "",
				goalType: "maintain",
				weeklyGoal: "",
			});
		}
		setSelectedTemplate(templateId);
	};

	// Clear weekly goal when goal type changes to maintain
	useEffect(() => {
		if (formData.goalType === "maintain") {
			setFormData((prev) => ({
				...prev,
				weeklyGoal: "",
			}));
		}
	}, [formData.goalType]);

	// Sync form data with user profile when modal opens or user data changes
	useEffect(() => {
		if (open && user) {
			setFormData((prev) => ({
				...prev,
				goalType: user.goalType || "maintain",
				weeklyGoal: user.weeklyGoal || "",
			}));
		}
	}, [open, user]);

	// Set unit for weight goals based on user units
	useEffect(() => {
		if (formData.type === "weight" && user?.units) {
			const unit = user.units === "imperial" ? "lbs" : "kg";
			setFormData((prev) => ({
				...prev,
				unit,
			}));
		}
	}, [formData.type, user?.units]);

	const handleSave = async () => {
		// Validate required fields
		if (!formData.name.trim()) {
			alert("Please enter a goal name");
			return;
		}
		if (!formData.unit.trim()) {
			alert("Please enter a unit for your goal");
			return;
		}
		if (formData.target <= 0) {
			alert("Please enter a valid target value");
			return;
		}

		const goalData: Goal & { goalType?: string; weeklyGoal?: number | string } =
			{
				id: goal?.id || crypto.randomUUID(),
				type: formData.type,
				name: formData.name,
				target: formData.target,
				unit: formData.unit,
				deadline: formData.deadline,
				current: goal?.current || 0,
				isActive: goal?.isActive ?? true,
				...(formData.type === "weight" && {
					goalType: formData.goalType,
					weeklyGoal: formData.weeklyGoal,
				}),
			};

		try {
			if (goal) {
				// Update existing goal
				const response = await fetch("/api/goals", {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: goal.id,
						type: formData.type,
						name: formData.name,
						target: formData.target,
						unit: formData.unit,
						deadline: formData.deadline,
						current: goal.current,
						isActive: goal.isActive,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					updateGoal(goal.id, data.goal);
				} else {
					console.error("Failed to update goal");
					return;
				}
			} else {
				// Create new goal
				const response = await fetch("/api/goals", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						type: formData.type,
						name: formData.name,
						target: formData.target,
						unit: formData.unit,
						deadline: formData.deadline,
						current: 0,
						isActive: true,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					addGoal(data.goal);
				} else {
					const errorData = await response.json().catch(() => ({}));
					console.error("Failed to create goal:", errorData);
					alert(`Failed to create goal: ${errorData.error || "Unknown error"}`);
					return;
				}
			}

			// Update user profile if this is a weight goal
			if (formData.type === "weight") {
				// Update local store
				updateUser({
					goalType: formData.goalType,
					weeklyGoal:
						typeof formData.weeklyGoal === "number" && formData.weeklyGoal > 0
							? formData.weeklyGoal
							: undefined,
				});

				// Save to database
				try {
					await fetch("/api/user-profile", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							goalType: formData.goalType,
							weeklyGoal:
								typeof formData.weeklyGoal === "number" &&
								formData.weeklyGoal > 0
									? formData.weeklyGoal
									: undefined,
						}),
					});
				} catch (error) {
					console.error("Failed to save user profile:", error);
				}
			}

			onSave?.(goalData);
			setOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error saving goal:", error);
		}
	};

	const resetForm = () => {
		setFormData({
			type: "custom",
			name: "",
			target: 1,
			unit: "",
			deadline: "",
			goalType: "maintain",
			weeklyGoal: "",
		});
		setSelectedTemplate("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button>{goal ? "Edit Goal" : "Add New Goal"}</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
					<DialogDescription>
						{goal
							? "Update your goal settings."
							: "Choose a template or create a custom goal."}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					{!goal && (
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="template" className="text-right">
								Template
							</Label>
							<Select
								value={selectedTemplate}
								onValueChange={handleTemplateSelect}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Choose a template (optional)" />
								</SelectTrigger>
								<SelectContent>
									{goalTemplates.map((template) => (
										<SelectItem key={template.id} value={template.id}>
											{template.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="type" className="text-right">
							Type
						</Label>
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData({ ...formData, type: value as Goal["type"] })
							}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="weight">Weight</SelectItem>
								<SelectItem value="macro">Macro</SelectItem>
								<SelectItem value="activity">Activity</SelectItem>
								<SelectItem value="water">Water</SelectItem>
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="col-span-3"
							placeholder="Goal name"
						/>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="target" className="text-right">
							Target
						</Label>
						<Input
							id="target"
							type="number"
							value={formData.target}
							onChange={(e) => {
								const value = e.target.value;
								const numValue = value === "" ? 0 : Number(value);
								setFormData({ ...formData, target: numValue });
							}}
							className="col-span-3"
							placeholder="Target value"
						/>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="unit" className="text-right">
							Unit
						</Label>
						<Input
							id="unit"
							value={formData.unit}
							onChange={(e) =>
								setFormData({ ...formData, unit: e.target.value })
							}
							className="col-span-3"
							placeholder="e.g., lbs, days, g"
						/>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="deadline" className="text-right">
							Deadline
						</Label>
						<Input
							id="deadline"
							value={formData.deadline}
							onChange={(e) =>
								setFormData({ ...formData, deadline: e.target.value })
							}
							className="col-span-3"
							placeholder="Optional deadline"
						/>
					</div>

					{formData.type === "weight" && (
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="goalType" className="text-right">
								Goal Type
							</Label>
							<Select
								value={formData.goalType}
								onValueChange={(value) =>
									setFormData({
										...formData,
										goalType: value as "lose" | "maintain" | "gain",
									})
								}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="lose">Lose Weight</SelectItem>
									<SelectItem value="maintain">Maintain Weight</SelectItem>
									<SelectItem value="gain">Gain Weight</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}

					{formData.type === "weight" &&
						(formData.goalType === "lose" || formData.goalType === "gain") && (
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="weeklyGoal" className="text-right">
									Weekly Goal
								</Label>
								<Select
									value={formData.weeklyGoal?.toString() || ""}
									onValueChange={(value) =>
										setFormData({
											...formData,
											weeklyGoal: value === "" ? "" : Number.parseFloat(value),
										})
									}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="0.5">0.5 lbs/week</SelectItem>
										<SelectItem value="1">1 lb/week</SelectItem>
										<SelectItem value="1.5">1.5 lbs/week</SelectItem>
										<SelectItem value="2">2 lbs/week</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="deadline" className="text-right">
							Deadline
						</Label>
						<Input
							id="deadline"
							value={formData.deadline}
							onChange={(e) =>
								setFormData({ ...formData, deadline: e.target.value })
							}
							className="col-span-3"
							placeholder="Optional deadline"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="submit" onClick={handleSave}>
						{goal ? "Update Goal" : "Create Goal"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
