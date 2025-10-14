export interface User {
	id: string;
	name: string;
	email: string;
	username?: string;
	avatar?: string;
	currentWeight: number;
	goalWeight: number;
	startingWeight?: number; // Weight when goal was set
	height: number;
	age: number;
	gender: "male" | "female" | "other";
	activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active";
	goalType: "lose" | "maintain" | "gain";
	weeklyGoal: number; // lbs per week
	dailyCalorieGoal: number;
	macroGoals: {
		protein: number; // grams
		carbs: number;
		fat: number;
	};
	waterGoal: number; // oz
	waterGoalUnit?: "oz" | "ml";
	isPremium: boolean;
	units: "metric" | "imperial";
	timezone: string;
}

export interface Food {
	id: string;
	name: string;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber?: number;
	sugar?: number;
	sodium?: number;
	servingSize: string;
	servingUnit: string;
	isPublic: boolean;
	createdBy: string;
	category?: string;
	source?: "usda" | "user";
	isVerified?: boolean;
}

export interface Meal {
	id: string;
	name: string;
	foods: { foodId: string; servings: number }[];
	totalCalories: number;
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
	isPublic: boolean;
	createdBy: string;
	imageUrl?: string;
}

export interface MealEntry {
	id: string;
	date: string;
	mealType: "breakfast" | "lunch" | "dinner" | "snacks";
	foodId?: string;
	mealId?: string;
	servings: number;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	notes?: string;
}

export interface Workout {
	id: string;
	name: string;
	type: "cardio" | "strength" | "yoga" | "sports" | "other";
	duration: number; // minutes
	caloriesBurned: number;
	date: string;
	notes?: string;
}

export interface Goal {
	id: string;
	type: "weight" | "macro" | "activity" | "water" | "custom";
	name: string;
	target: number;
	current: number;
	unit: string;
	deadline?: string;
	isActive: boolean;
	isArchived?: boolean;
	startDate?: Date;
	completedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Achievement {
	id: string;
	achievementId: string;
	name: string;
	description: string;
	icon?: string;
	category: string;
	requirement?: string;
	triggerType?: "manual" | "automatic";
	unlockedAt?: Date;
	isUnlocked?: boolean;
}

export interface PresetAchievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: string;
	requirement: string; // Description of what needs to be done
	triggerType: "manual" | "automatic"; // How it's unlocked
	triggerCondition?: unknown; // Data for automatic triggering
}

// Mock Data
export const mockUser: User = {
	id: "1",
	name: "Sarah Johnson",
	email: "sarah@example.com",
	avatar: "/diverse-woman-smiling.png",
	currentWeight: 59, // kg (approximately 130 lbs)
	goalWeight: 64, // kg (approximately 141 lbs)
	height: 168, // cm (approximately 5'6")
	age: 28,
	gender: "female",
	activityLevel: "moderate",
	goalType: "lose",
	weeklyGoal: 0.45, // kg per week (approximately 1 lb)
	dailyCalorieGoal: 1650,
	macroGoals: {
		protein: 120,
		carbs: 180,
		fat: 55,
	},
	waterGoal: 64,
	isPremium: false,
	units: "imperial",
	timezone: "America/New_York",
};

export const mockFoods: Food[] = [
	{
		id: "1",
		name: "Grilled Chicken Breast",
		calories: 165,
		protein: 31,
		carbs: 0,
		fat: 3.6,
		fiber: 0,
		servingSize: "100",
		servingUnit: "g",
		isPublic: true,
		createdBy: "system",
		category: "Protein",
	},
	{
		id: "2",
		name: "Brown Rice",
		calories: 112,
		protein: 2.6,
		carbs: 24,
		fat: 0.9,
		fiber: 1.8,
		servingSize: "100",
		servingUnit: "g",
		isPublic: true,
		createdBy: "system",
		category: "Grains",
	},
	{
		id: "3",
		name: "Avocado",
		calories: 160,
		protein: 2,
		carbs: 8.5,
		fat: 14.7,
		fiber: 6.7,
		servingSize: "100",
		servingUnit: "g",
		isPublic: true,
		createdBy: "system",
		category: "Healthy Fats",
	},
	{
		id: "4",
		name: "Greek Yogurt",
		calories: 59,
		protein: 10,
		carbs: 3.6,
		fat: 0.4,
		servingSize: "100",
		servingUnit: "g",
		isPublic: true,
		createdBy: "system",
		category: "Dairy",
	},
];

export const mockMeals: Meal[] = [
	{
		id: "1",
		name: "Mediterranean Quinoa Salad",
		foods: [
			{ foodId: "1", servings: 1.5 },
			{ foodId: "2", servings: 1 },
		],
		totalCalories: 360,
		totalProtein: 35,
		totalCarbs: 24,
		totalFat: 8,
		isPublic: true,
		createdBy: "1",
		imageUrl: "/mediterranean-quinoa-salad.png",
	},
	{
		id: "2",
		name: "Lemon Herb Salmon",
		foods: [
			{ foodId: "1", servings: 1 },
			{ foodId: "3", servings: 0.5 },
		],
		totalCalories: 245,
		totalProtein: 33,
		totalCarbs: 4,
		totalFat: 11,
		isPublic: true,
		createdBy: "1",
		imageUrl: "/lemon-herb-salmon.jpg",
	},
];

export const mockWorkouts: Workout[] = [
	{
		id: "1",
		name: "Morning Run",
		type: "cardio",
		duration: 30,
		caloriesBurned: 315,
		date: new Date().toISOString(),
		notes: "3.5 mi, 15cal",
	},
	{
		id: "2",
		name: "Evening Yoga",
		type: "yoga",
		duration: 45,
		caloriesBurned: 180,
		date: new Date().toISOString(),
	},
	{
		id: "3",
		name: "Evening Yoga",
		type: "yoga",
		duration: 45,
		caloriesBurned: 0,
		date: new Date().toISOString(),
		notes: "45 min, 10lbs",
	},
	{
		id: "4",
		name: "Lat Strength Training",
		type: "strength",
		duration: 60,
		caloriesBurned: 0,
		date: new Date().toISOString(),
		notes: "4 P 00 lbs",
	},
];

export const mockGoals: Goal[] = [
	{
		id: "1",
		type: "weight",
		name: "Weight Goal",
		target: -10,
		current: -7,
		unit: "lbs",
		deadline: "5 Ranainhnay",
		isActive: true,
	},
	{
		id: "2",
		type: "macro",
		name: "Protein",
		target: 120,
		current: 0,
		unit: "g",
		isActive: true,
	},
	{
		id: "3",
		type: "activity",
		name: "Workouts",
		target: 4,
		current: 0,
		unit: "week",
		isActive: true,
	},
];

export const presetAchievements: PresetAchievement[] = [
	{
		id: "first-workout",
		name: "First Steps",
		description: "Complete your first workout",
		icon: "🏃",
		category: "fitness",
		requirement: "Log your first workout session",
		triggerType: "manual",
	},
	{
		id: "week-streak",
		name: "Week Warrior",
		description: "Work out for 7 consecutive days",
		icon: "🔥",
		category: "consistency",
		requirement: "Complete workouts for 7 days in a row",
		triggerType: "automatic",
		triggerCondition: { type: "streak", days: 7 },
	},
	{
		id: "month-streak",
		name: "Monthly Master",
		description: "Work out for 30 consecutive days",
		icon: "👑",
		category: "consistency",
		requirement: "Complete workouts for 30 days in a row",
		triggerType: "automatic",
		triggerCondition: { type: "streak", days: 30 },
	},
	{
		id: "protein-champion",
		name: "Protein Champion",
		description: "Hit your daily protein goal 10 times",
		icon: "💪",
		category: "nutrition",
		requirement: "Reach your daily protein target 10 times",
		triggerType: "automatic",
		triggerCondition: { type: "goal_hits", goalType: "macro", count: 10 },
	},
	{
		id: "water-warrior",
		name: "Hydration Hero",
		description: "Meet your daily water goal 14 times",
		icon: "💧",
		category: "hydration",
		requirement: "Reach your daily water target 14 times",
		triggerType: "automatic",
		triggerCondition: { type: "goal_hits", goalType: "water", count: 14 },
	},
	{
		id: "meal-master",
		name: "Meal Master",
		description: "Log 50 meals",
		icon: "🍽️",
		category: "nutrition",
		requirement: "Log a total of 50 meals",
		triggerType: "automatic",
		triggerCondition: { type: "meal_count", count: 50 },
	},
	{
		id: "weight-loss-warrior",
		name: "Weight Loss Warrior",
		description: "Lose 5 pounds",
		icon: "⚖️",
		category: "weight",
		requirement: "Lose 5 pounds from your starting weight",
		triggerType: "automatic",
		triggerCondition: { type: "weight_loss", pounds: 5 },
	},
	{
		id: "early-bird",
		name: "Early Bird",
		description: "Complete 10 morning workouts",
		icon: "🌅",
		category: "fitness",
		requirement: "Finish 10 workouts before 9 AM",
		triggerType: "automatic",
		triggerCondition: { type: "morning_workouts", count: 10 },
	},
];

export const mockProgressData = [
	{ date: "July", value: 5 },
	{ date: "July", value: 6.5 },
	{ date: "July", value: 5.5 },
	{ date: "August", value: 7 },
	{ date: "August", value: 6 },
	{ date: "28", value: 6.5 },
	{ date: "180", value: 8 },
];
