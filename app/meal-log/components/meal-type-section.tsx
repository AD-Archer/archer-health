"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MealEntry } from "@/app/data/data";
import { AddEntryModal } from "@/components/add-entry-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";

interface MealTypeSectionProps {
	mealType: "breakfast" | "lunch" | "dinner" | "snacks";
	selectedDate: Date;
}

export function MealTypeSection({
	mealType,
	selectedDate,
}: MealTypeSectionProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deletingEntries, setDeletingEntries] = useState<Set<string>>(
		new Set(),
	);
	const mealEntries = useStore((state) => state.mealEntries);
	const foods = useStore((state) => state.foods);
	const meals = useStore((state) => state.meals);
	const removeMealEntry = useStore((state) => state.removeMealEntry);

	const selectedDateString = selectedDate.toISOString().split("T")[0];
	const entries = mealEntries.filter(
		(entry) =>
			entry.date.startsWith(selectedDateString) && entry.mealType === mealType,
	);

	console.log(`MealTypeSection ${mealType}:`, {
		entries,
		foods,
		selectedDateString,
	});

	const totals = entries.reduce(
		(acc, entry) => ({
			calories: acc.calories + entry.calories,
			protein: acc.protein + entry.protein,
			carbs: acc.carbs + entry.carbs,
			fat: acc.fat + entry.fat,
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0 },
	);

	const getMealTypeName = () => {
		return mealType.charAt(0).toUpperCase() + mealType.slice(1);
	};

	const handleDeleteEntry = async (entryId: string) => {
		setDeletingEntries((prev) => new Set(prev).add(entryId));
		try {
			const success = await removeMealEntry(entryId);
			if (!success) {
				// Could show a toast notification here
				console.error("Failed to delete entry");
			}
		} finally {
			setDeletingEntries((prev) => {
				const newSet = new Set(prev);
				newSet.delete(entryId);
				return newSet;
			});
		}
	};

	const getEntryName = (entry: MealEntry) => {
		if (entry.foodId) {
			const food = foods.find((f) => f.id === entry.foodId);
			return food?.name || "Unknown Food";
		}
		if (entry.mealId) {
			const meal = meals.find((m) => m.id === entry.mealId);
			return meal?.name || "Unknown Meal";
		}
		return "Unknown";
	};

	return (
		<>
			<Card className="p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-lg font-semibold">{getMealTypeName()}</h3>
						{entries.length > 0 && (
							<p className="text-sm text-muted-foreground">
								{Math.round(totals.calories)} cal • P:{" "}
								{Math.round(totals.protein)}g • C: {Math.round(totals.carbs)}g •
								F: {Math.round(totals.fat)}g
							</p>
						)}
					</div>
					<Button size="sm" onClick={() => setIsModalOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Add Food
					</Button>
				</div>

				{entries.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p>No foods logged yet</p>
					</div>
				) : (
					<div className="space-y-2">
						{entries.map((entry) => (
							<div
								key={entry.id}
								className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
							>
								<div className="flex-1">
									<div className="font-medium">{getEntryName(entry)}</div>
									<div className="text-sm text-muted-foreground">
										{entry.servings} serving{entry.servings !== 1 ? "s" : ""} •{" "}
										{Math.round(entry.calories)} cal • P:{" "}
										{Math.round(entry.protein)}g • C: {Math.round(entry.carbs)}g
										• F: {Math.round(entry.fat)}g
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleDeleteEntry(entry.id)}
									disabled={deletingEntries.has(entry.id)}
								>
									{deletingEntries.has(entry.id) ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Trash2 className="w-4 h-4 text-destructive" />
									)}
								</Button>
							</div>
						))}
					</div>
				)}
			</Card>

			<AddEntryModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				selectedDate={selectedDate}
			/>
		</>
	);
}
