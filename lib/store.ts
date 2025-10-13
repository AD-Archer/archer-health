import { create } from "zustand";
import type {
	Food,
	Goal,
	Meal,
	MealEntry,
	User,
	Workout,
} from "@/app/data/data";
import { updateGoalProgress } from "./goal-progress";

interface AppState {
	user: User | null;
	foods: Food[];
	meals: Meal[];
	workouts: Workout[];
	goals: Goal[];
	mealEntries: MealEntry[];
	waterIntake: number;
	refetchTrigger: number;

	// Actions
	updateUser: (user: Partial<User>) => void;
	addFood: (food: Food) => void;
	addMeal: (meal: Meal) => void;
	addWorkout: (workout: Workout) => void;
	addGoal: (goal: Goal) => void;
	setGoals: (goals: Goal[]) => void;
	updateGoal: (id: string, goal: Partial<Goal>) => void;
	updateGoalProgress: (id: string) => void;
	addMealEntry: (entry: MealEntry) => void;
	removeMealEntry: (id: string) => void;
	updateWaterIntake: (amount: number) => void;
	triggerRefetch: () => void;
}

export const useStore = create<AppState>((set) => ({
	user: null, // Start with null, will be populated from API
	foods: [],
	meals: [],
	workouts: [],
	goals: [],
	mealEntries: [],
	waterIntake: 0,
	refetchTrigger: 0,

	updateUser: (userData) =>
		set((state) => ({
			user: state.user ? { ...state.user, ...userData } : (userData as User),
		})),

	addFood: (food) =>
		set((state) => ({
			foods: [...state.foods, food],
		})),

	addMeal: (meal) =>
		set((state) => ({
			meals: [...state.meals, meal],
		})),

	addWorkout: (workout) =>
		set((state) => ({
			workouts: [...state.workouts, workout],
		})),

	addGoal: (goal) =>
		set((state) => ({
			goals: [...state.goals, goal],
		})),

	setGoals: (goals) =>
		set(() => ({
			goals,
		})),

	updateGoal: (id, goalData) =>
		set((state) => ({
			goals: state.goals.map((g) => (g.id === id ? { ...g, ...goalData } : g)),
		})),

	updateGoalProgress: (id) =>
		set((state) => ({
			goals: state.goals.map((g) =>
				g.id === id && state.user
					? updateGoalProgress(g, state.user, state.mealEntries, state.workouts)
					: g,
			),
		})),

	addMealEntry: (entry) =>
		set((state) => ({
			mealEntries: [...state.mealEntries, entry],
		})),

	removeMealEntry: (id) =>
		set((state) => ({
			mealEntries: state.mealEntries.filter((entry) => entry.id !== id),
		})),

	updateWaterIntake: (amount) => set({ waterIntake: amount }),
	triggerRefetch: () =>
		set((state) => ({ refetchTrigger: state.refetchTrigger + 1 })),
}));
