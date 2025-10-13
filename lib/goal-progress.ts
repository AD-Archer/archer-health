import type { Goal, MealEntry, User, Workout } from "@/app/data/data";

export function calculateGoalProgress(
	goal: Goal,
	user: User,
	mealEntries: MealEntry[],
	workouts: Workout[],
): number {
	switch (goal.type) {
		case "weight":
			// For weight goals, current represents progress towards target
			return goal.current;

		case "macro":
			if (goal.name.toLowerCase().includes("protein")) {
				// Count days where protein goal was met
				const today = new Date().toDateString();
				const todaysEntries = mealEntries.filter(
					(entry) => new Date(entry.date).toDateString() === today,
				);
				const totalProtein = todaysEntries.reduce(
					(sum, entry) => sum + entry.protein,
					0,
				);
				return totalProtein >= user.macroGoals.protein ? 1 : 0;
			}
			return goal.current;

		case "activity": {
			// Count workouts in current week
			const now = new Date();
			const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
			const weekWorkouts = workouts.filter(
				(workout) => new Date(workout.date) >= startOfWeek,
			);
			return weekWorkouts.length;
		}

		case "water":
			// This would need water intake tracking
			return goal.current;

		case "custom":
			// Handle custom goal types
			if (goal.name.toLowerCase().includes("input weight")) {
				// This would need weight entry history - for now return current
				return goal.current;
			}
			if (goal.name.toLowerCase().includes("log food")) {
				// Count days with meal entries in the period
				const uniqueDays = new Set(mealEntries.map((entry) => entry.date)).size;
				return uniqueDays;
			}
			if (goal.name.toLowerCase().includes("stay within calorie")) {
				// Count days where calories were within goal
				const dayCalories = new Map<string, number>();
				mealEntries.forEach((entry) => {
					const day = entry.date;
					dayCalories.set(day, (dayCalories.get(day) || 0) + entry.calories);
				});
				let streakDays = 0;
				for (const calories of dayCalories.values()) {
					if (calories <= user.dailyCalorieGoal) {
						streakDays++;
					} else {
						break; // Streak broken
					}
				}
				return streakDays;
			}
			return goal.current;

		default:
			return goal.current;
	}
}

export function updateGoalProgress(
	goal: Goal,
	user: User,
	mealEntries: MealEntry[],
	workouts: Workout[],
): Goal {
	const newCurrent = calculateGoalProgress(goal, user, mealEntries, workouts);
	return {
		...goal,
		current: newCurrent,
	};
}
