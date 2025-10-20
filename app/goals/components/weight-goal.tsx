"use client";

import { CheckCircle, Edit, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { calculateNutritionNeeds } from "@/lib/nutrition-calculator";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

export function WeightGoal() {
	const user = useStore((state) => state.user);
	const updateUser = useStore((state) => state.updateUser);
	const {
		getDisplayWeight,
		displayWeightToKg,
		getDisplayWeeklyGoal,
		displayWeeklyGoalToKg,
	} = useUnitConversion();

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		currentWeight: "",
		goalWeight: "",
		weeklyGoal: "",
		goalType: user?.goalType || "maintain",
	});
	const [isUpdating, setIsUpdating] = useState(false);

	const [isEditingNutrition, setIsEditingNutrition] = useState(false);
	const [nutritionEditForm, setNutritionEditForm] = useState({
		calories: "",
		protein: "",
		carbs: "",
		fat: "",
	});

	// Calculate nutrition needs - moved to top to avoid hook order issues
	const nutritionNeeds = useMemo(() => {
		if (user?.currentWeight && user?.height && user?.age && user?.gender) {
			return calculateNutritionNeeds(user);
		}
		return null;
	}, [user]);

	// Get display values for nutrition goals
	const displayCalories =
		user?.dailyCalorieGoal || nutritionNeeds?.calories || 0;
	const displayMacros = user?.macroGoals
		? (user.macroGoals as { protein: number; carbs: number; fat: number })
		: nutritionNeeds?.macros || { protein: 0, carbs: 0, fat: 0 };

	// Handle loading state when user data is not available
	if (!user) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Loading your weight goals...
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const currentDisplay = getDisplayWeight(user.currentWeight, user.units);
	const goalDisplay = getDisplayWeight(user.goalWeight, user.units);

	// Calculate progress based on starting weight
	const startingWeight = user.startingWeight || user.currentWeight;
	const startingDisplay = getDisplayWeight(startingWeight, user.units);

	let progress = 0;
	let remaining = 0;

	if (currentDisplay && goalDisplay && startingDisplay) {
		if (user.goalType === "lose") {
			// For weight loss: progress = (starting - current) / (starting - goal)
			const totalToLose = startingDisplay - goalDisplay;
			const lostSoFar = startingDisplay - currentDisplay;
			if (totalToLose > 0) {
				progress = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
			}
			remaining = Math.max(0, currentDisplay - goalDisplay);
		} else if (user.goalType === "gain") {
			// For weight gain: progress = (current - starting) / (goal - starting)
			const totalToGain = goalDisplay - startingDisplay;
			const gainedSoFar = currentDisplay - startingDisplay;
			if (totalToGain > 0) {
				progress = Math.min(
					100,
					Math.max(0, (gainedSoFar / totalToGain) * 100),
				);
			}
			remaining = Math.max(0, goalDisplay - currentDisplay);
		} else {
			// Maintain: no progress tracking
			remaining = 0;
			progress = 100; // Always "complete" for maintenance
		}
	}

	const unitLabel = user.units === "imperial" ? "lbs" : "kg";

	const handleEditClick = () => {
		const displayWeeklyGoal = getDisplayWeeklyGoal(user.weeklyGoal, user.units);
		setEditForm({
			currentWeight: currentDisplay?.toString() || "",
			goalWeight: goalDisplay?.toString() || "",
			weeklyGoal: displayWeeklyGoal?.toString() || "",
			goalType: user.goalType,
		});
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditForm({
			currentWeight: "",
			goalWeight: "",
			weeklyGoal: "",
			goalType: user.goalType,
		});
	};

	const handleSaveEdit = async () => {
		const currentWeight = parseFloat(editForm.currentWeight);
		const goalWeight = parseFloat(editForm.goalWeight);
		const weeklyGoal = parseFloat(editForm.weeklyGoal);

		if (Number.isNaN(currentWeight) || Number.isNaN(goalWeight)) {
			alert("Please enter valid weight values");
			return;
		}

		// Weekly goal is optional for maintain goals
		if (editForm.goalType !== "maintain" && Number.isNaN(weeklyGoal)) {
			alert("Please select a weekly goal");
			return;
		}

		setIsUpdating(true);
		try {
			// Convert display values to kg for storage
			const currentWeightKg = displayWeightToKg(currentWeight, user.units);
			const goalWeightKg = displayWeightToKg(goalWeight, user.units);
			const weeklyGoalKg = !Number.isNaN(weeklyGoal)
				? displayWeeklyGoalToKg(weeklyGoal, user.units)
				: undefined;

			// Set starting weight if this is the first time setting a goal
			let startingWeightKg = user.startingWeight;
			if (!startingWeightKg) {
				startingWeightKg = currentWeightKg;
			}

			// Update user profile
			const response = await fetch("/api/user-profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentWeight: currentWeightKg,
					goalWeight: goalWeightKg,
					startingWeight: startingWeightKg,
					weeklyGoal: weeklyGoalKg,
					goalType: editForm.goalType,
					name: user.name,
					email: user.email,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				updateUser({
					currentWeight: data.user.currentWeight,
					goalWeight: data.user.goalWeight,
					startingWeight: data.user.startingWeight,
					weeklyGoal: data.user.weeklyGoal,
					goalType: data.user.goalType,
				});
				setIsEditing(false);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Failed to update profile:", errorData);
				alert(
					`Failed to update profile: ${errorData.error || "Unknown error"}`,
				);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Network error. Please check your connection and try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCompleteGoal = async () => {
		if (progress < 100) return;

		setIsUpdating(true);
		try {
			// When goal is completed, set goal type to maintain and clear goal weight
			const response = await fetch("/api/user-profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentWeight: user.currentWeight,
					goalWeight: null, // Clear the goal weight
					startingWeight: user.startingWeight,
					weeklyGoal: null, // Clear weekly goal
					goalType: "maintain",
					name: user.name,
					email: user.email,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				updateUser({
					currentWeight: data.user.currentWeight,
					goalWeight: data.user.goalWeight,
					startingWeight: data.user.startingWeight,
					weeklyGoal: data.user.weeklyGoal,
					goalType: data.user.goalType,
				});
				// Show success message
				alert("🎉 Congratulations! Your weight goal has been completed!");
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Failed to complete goal:", errorData);
				alert(`Failed to complete goal: ${errorData.error || "Unknown error"}`);
			}
		} catch (error) {
			console.error("Error completing goal:", error);
			alert("Network error. Please check your connection and try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleEditNutritionClick = () => {
		const userMacroGoals = user.macroGoals as {
			protein?: number;
			carbs?: number;
			fat?: number;
		} | null;
		setNutritionEditForm({
			calories: user.dailyCalorieGoal?.toString() || "",
			protein: userMacroGoals?.protein?.toString() || "",
			carbs: userMacroGoals?.carbs?.toString() || "",
			fat: userMacroGoals?.fat?.toString() || "",
		});
		setIsEditingNutrition(true);
	};

	const handleCancelNutritionEdit = () => {
		setIsEditingNutrition(false);
		setNutritionEditForm({
			calories: "",
			protein: "",
			carbs: "",
			fat: "",
		});
	};

	const handleSaveNutritionEdit = async () => {
		const calories = parseInt(nutritionEditForm.calories);
		const protein = parseInt(nutritionEditForm.protein);
		const carbs = parseInt(nutritionEditForm.carbs);
		const fat = parseInt(nutritionEditForm.fat);

		if (Number.isNaN(calories) || calories <= 0) {
			alert("Please enter a valid calorie goal");
			return;
		}
		if (Number.isNaN(protein) || protein <= 0) {
			alert("Please enter a valid protein goal");
			return;
		}
		if (Number.isNaN(carbs) || carbs <= 0) {
			alert("Please enter a valid carbs goal");
			return;
		}
		if (Number.isNaN(fat) || fat <= 0) {
			alert("Please enter a valid fat goal");
			return;
		}

		setIsUpdating(true);
		try {
			const response = await fetch("/api/user-profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					dailyCalorieGoal: calories,
					macroGoals: {
						protein,
						carbs,
						fat,
					},
					name: user.name,
					email: user.email,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				updateUser({
					dailyCalorieGoal: data.user.dailyCalorieGoal,
					macroGoals: data.user.macroGoals,
				});
				setIsEditingNutrition(false);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Failed to update nutrition goals:", errorData);
				alert(
					`Failed to update nutrition goals: ${errorData.error || "Unknown error"}`,
				);
			}
		} catch (error) {
			console.error("Error updating nutrition goals:", error);
			alert("Network error. Please check your connection and try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Main Weight Goal - Prominent */}
			<Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl font-display flex items-center gap-2">
								🎯 Main Goal:{" "}
								{user.goalType === "lose"
									? "Lose"
									: user.goalType === "gain"
										? "Gain"
										: "Maintain"}{" "}
								Weight
							</CardTitle>
							<p className="text-muted-foreground mt-1">
								{user.weeklyGoal
									? `${getDisplayWeeklyGoal(user.weeklyGoal, user.units)} ${unitLabel} per week`
									: "Set your weekly goal"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{!isEditing ? (
								<Button
									variant="outline"
									size="sm"
									onClick={handleEditClick}
									className="flex items-center gap-2"
								>
									<Edit className="w-4 h-4" />
									Edit Goal
								</Button>
							) : (
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handleCancelEdit}
										disabled={isUpdating}
									>
										<X className="w-4 h-4" />
									</Button>
									<Button
										size="sm"
										onClick={handleSaveEdit}
										disabled={isUpdating}
										className="flex items-center gap-2"
									>
										<Save className="w-4 h-4" />
										{isUpdating ? "Saving..." : "Save"}
									</Button>
								</div>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-center">
						<div className="relative w-48 h-48">
							<svg className="w-full h-full -rotate-90">
								<circle
									cx="96"
									cy="96"
									r="80"
									stroke="currentColor"
									strokeWidth="16"
									fill="none"
									className="text-muted"
								/>
								<circle
									cx="96"
									cy="96"
									r="80"
									stroke="currentColor"
									strokeWidth="16"
									fill="none"
									strokeDasharray={`${2 * Math.PI * 80}`}
									strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
									className="text-primary transition-all duration-500"
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								{progress >= 100 && user.goalType !== "maintain" ? (
									<div className="text-center">
										<CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
										<span className="text-lg font-bold font-display text-green-600">
											Goal Complete!
										</span>
									</div>
								) : (
									<>
										<span className="text-4xl font-bold font-display">
											{remaining} {unitLabel}
										</span>
										<span className="text-sm text-muted-foreground">
											{user.goalType === "lose"
												? "To Lose"
												: user.goalType === "gain"
													? "To Gain"
													: "Remaining"}
										</span>
									</>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Progress</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<Progress value={progress} className="h-3" />
						{progress >= 100 && user.goalType !== "maintain" && (
							<div className="flex justify-center mt-4">
								<Button
									onClick={handleCompleteGoal}
									disabled={isUpdating}
									className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
								>
									<CheckCircle className="w-4 h-4" />
									{isUpdating ? "Completing..." : "Mark Goal as Complete"}
								</Button>
							</div>
						)}
					</div>

					{/* Edit Form */}
					{isEditing && (
						<div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-current-weight">Current Weight</Label>
									<div className="relative">
										<Input
											id="edit-current-weight"
											type="number"
											step="0.1"
											value={editForm.currentWeight}
											onChange={(e) =>
												setEditForm((prev) => ({
													...prev,
													currentWeight: e.target.value,
												}))
											}
											placeholder={`Weight in ${unitLabel}`}
											className="pr-12"
										/>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
											{unitLabel}
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-goal-weight">Goal Weight</Label>
									<div className="relative">
										<Input
											id="edit-goal-weight"
											type="number"
											step="0.1"
											value={editForm.goalWeight}
											onChange={(e) =>
												setEditForm((prev) => ({
													...prev,
													goalWeight: e.target.value,
												}))
											}
											placeholder={`Weight in ${unitLabel}`}
											className="pr-12"
										/>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
											{unitLabel}
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-weekly-goal">Weekly Goal</Label>
									<Select
										value={editForm.weeklyGoal}
										onValueChange={(value) =>
											setEditForm((prev) => ({ ...prev, weeklyGoal: value }))
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select weekly goal" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="0.5">
												0.5 {unitLabel}/week (Safe & Sustainable)
											</SelectItem>
											<SelectItem value="1">
												1 {unitLabel}/week (Recommended)
											</SelectItem>
											<SelectItem value="1.5">
												1.5 {unitLabel}/week (Aggressive)
											</SelectItem>
											<SelectItem value="2">
												2 {unitLabel}/week (Very Aggressive)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-goal-type">Goal Type</Label>
								<Select
									value={editForm.goalType}
									onValueChange={(value: "lose" | "maintain" | "gain") =>
										setEditForm((prev) => ({ ...prev, goalType: value }))
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="lose">Lose Weight</SelectItem>
										<SelectItem value="maintain">Maintain Weight</SelectItem>
										<SelectItem value="gain">Gain Weight</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
						<div>
							<p className="text-sm text-muted-foreground">Current Weight</p>
							<p className="text-2xl font-bold">
								{currentDisplay} {unitLabel}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Goal Weight</p>
							<p className="text-2xl font-bold">
								{goalDisplay} {unitLabel}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Nutrition Needs */}
			{nutritionNeeds && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-xl font-display">
									📊 Your Nutrition Needs
								</CardTitle>
								<p className="text-muted-foreground">
									Calculated based on your profile and goals
								</p>
							</div>
							<div className="flex items-center gap-2">
								{!isEditingNutrition ? (
									<Button
										variant="outline"
										size="sm"
										onClick={handleEditNutritionClick}
										className="flex items-center gap-2"
									>
										<Edit className="w-4 h-4" />
										Edit Goals
									</Button>
								) : (
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleCancelNutritionEdit}
											disabled={isUpdating}
										>
											<X className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											onClick={handleSaveNutritionEdit}
											disabled={isUpdating}
											className="flex items-center gap-2"
										>
											<Save className="w-4 h-4" />
											{isUpdating ? "Saving..." : "Save"}
										</Button>
									</div>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
								<div className="text-3xl font-bold text-blue-600">
									{displayCalories}
								</div>
								<div className="text-sm text-muted-foreground">
									Calories/Day
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
								<div className="text-3xl font-bold text-green-600">
									{displayMacros.protein}g
								</div>
								<div className="text-sm text-muted-foreground">Protein</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
								<div className="text-3xl font-bold text-orange-600">
									{displayMacros.carbs}g
								</div>
								<div className="text-sm text-muted-foreground">Carbs</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 md:col-start-2">
								<div className="text-3xl font-bold text-purple-600">
									{displayMacros.fat}g
								</div>
								<div className="text-sm text-muted-foreground">Fat</div>
							</div>
						</div>

						{/* Edit Form */}
						{isEditingNutrition && (
							<div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div className="space-y-2">
										<Label htmlFor="edit-calories">Calories</Label>
										<Input
											id="edit-calories"
											type="number"
											value={nutritionEditForm.calories}
											onChange={(e) =>
												setNutritionEditForm((prev) => ({
													...prev,
													calories: e.target.value,
												}))
											}
											placeholder="Daily calories"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-protein">Protein (g)</Label>
										<Input
											id="edit-protein"
											type="number"
											value={nutritionEditForm.protein}
											onChange={(e) =>
												setNutritionEditForm((prev) => ({
													...prev,
													protein: e.target.value,
												}))
											}
											placeholder="Protein in grams"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-carbs">Carbs (g)</Label>
										<Input
											id="edit-carbs"
											type="number"
											value={nutritionEditForm.carbs}
											onChange={(e) =>
												setNutritionEditForm((prev) => ({
													...prev,
													carbs: e.target.value,
												}))
											}
											placeholder="Carbs in grams"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-fat">Fat (g)</Label>
										<Input
											id="edit-fat"
											type="number"
											value={nutritionEditForm.fat}
											onChange={(e) =>
												setNutritionEditForm((prev) => ({
													...prev,
													fat: e.target.value,
												}))
											}
											placeholder="Fat in grams"
										/>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<h4 className="font-semibold">Key Micronutrients</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
								<Badge variant="outline">
									Vitamin D: {nutritionNeeds.micronutrients.vitaminD}mcg
								</Badge>
								<Badge variant="outline">
									Vitamin C: {nutritionNeeds.micronutrients.vitaminC}mg
								</Badge>
								<Badge variant="outline">Calcium: 1000mg</Badge>
								<Badge variant="outline">
									Iron: {user.gender === "male" ? "8mg" : "18mg"}
								</Badge>
								<Badge variant="outline">
									Magnesium: {nutritionNeeds.micronutrients.magnesium}mg
								</Badge>
								<Badge variant="outline">
									Zinc: {nutritionNeeds.micronutrients.zinc}mg
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
