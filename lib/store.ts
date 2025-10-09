import { create } from "zustand"
import {
  mockUser,
  mockFoods,
  mockMeals,
  mockWorkouts,
  mockGoals,
  type User,
  type Food,
  type Meal,
  type Workout,
  type Goal,
  type MealEntry,
} from "@/app/data/data"

interface AppState {
  user: User
  foods: Food[]
  meals: Meal[]
  workouts: Workout[]
  goals: Goal[]
  mealEntries: MealEntry[]
  waterIntake: number

  // Actions
  updateUser: (user: Partial<User>) => void
  addFood: (food: Food) => void
  addMeal: (meal: Meal) => void
  addWorkout: (workout: Workout) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  addMealEntry: (entry: MealEntry) => void
  removeMealEntry: (id: string) => void
  updateWaterIntake: (amount: number) => void
}

export const useStore = create<AppState>((set) => ({
  user: mockUser,
  foods: mockFoods,
  meals: mockMeals,
  workouts: mockWorkouts,
  goals: mockGoals,
  mealEntries: [],
  waterIntake: 0,

  updateUser: (userData) =>
    set((state) => ({
      user: { ...state.user, ...userData },
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

  updateGoal: (id, goalData) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...goalData } : g)),
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
}))
