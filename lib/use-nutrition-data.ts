"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";

interface CalorieData {
	date: string;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	mealsLogged: number;
}

interface ProgressData {
	calorieHistory: CalorieData[];
	averages: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
		weight: number;
	};
	todayNutrition: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
		mealsLogged: number;
	};
	weeklyStats: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
		daysLogged: number;
	};
	monthlyStats: {
		calories: number;
		daysLogged: number;
		averageDailyCalories: number;
	};
	streaks: {
		current: number;
		longest: number;
		currentMeal: number;
		longestMeal: number;
	};
	weightHistory: Array<{
		id: string;
		weight: number;
		date: string;
		entries?: number;
	}>;
	goals: Array<{
		id: string;
		type: string;
		name: string;
		target: number;
		current: number;
		unit: string;
	}>;
	bmi: number | null;
	totalMealsLogged: number;
	totalDaysTracked: number;
}

export function useNutritionData() {
	const [apiData, setApiData] = useState<ProgressData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const mealEntries = useStore((state) => state.mealEntries);

	useEffect(() => {
		const fetchProgress = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/progress");
				if (response.ok) {
					const data = await response.json();
					setApiData(data);
					setError(null);
				} else {
					setError("Failed to fetch progress data");
				}
			} catch (err) {
				setError("Error fetching progress data");
				console.error("Error fetching progress data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProgress();
	}, []); // Only fetch on mount

	// Calculate today's nutrition from store data (reactive)
	const todayNutrition = useMemo(() => {
		const today = new Date().toISOString().split("T")[0];
		const todayEntries = mealEntries.filter((entry) =>
			entry.date.startsWith(today),
		);

		return {
			calories: todayEntries.reduce((sum, entry) => sum + entry.calories, 0),
			protein: todayEntries.reduce((sum, entry) => sum + entry.protein, 0),
			carbs: todayEntries.reduce((sum, entry) => sum + entry.carbs, 0),
			fat: todayEntries.reduce((sum, entry) => sum + entry.fat, 0),
			mealsLogged: todayEntries.length,
		};
	}, [mealEntries]);

	// Combine API data with reactive store data
	const progressData = useMemo(() => {
		if (!apiData) return null;

		// Replace today's nutrition with reactive data from store
		return {
			...apiData,
			todayNutrition,
		};
	}, [apiData, todayNutrition]);

	return {
		progressData,
		loading,
		error,
		refetch: () => {
			// Trigger a refetch by updating the refetch trigger
			const store = useStore.getState();
			store.triggerRefetch();
		},
	};
}
