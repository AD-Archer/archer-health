import { auth } from "@clerk/nextjs/server";
import {
	differenceInDays,
	format,
	isAfter,
	startOfDay,
	subDays,
} from "date-fns";
import { type NextRequest, NextResponse } from "next/server";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		let user;
		try {
			user = await ensureUser(userId);
		} catch (creationError) {
			console.error("Error ensuring user exists:", creationError);
			return NextResponse.json(
				{ error: "Failed to create user record" },
				{ status: 500 },
			);
		}

		// Get weight entries (last 90 days)
		const ninetyDaysAgo = subDays(new Date(), 90);
		const weightEntries = await prisma.weightEntry.findMany({
			where: {
				userId: user.id,
				date: {
					gte: ninetyDaysAgo,
				},
			},
			orderBy: { date: "asc" },
		});

		// Process weight entries to calculate daily averages
		const weightHistory = weightEntries.reduce(
			(acc, entry) => {
				const dateKey = format(entry.date, "yyyy-MM-dd");
				if (!acc[dateKey]) {
					acc[dateKey] = {
						date: entry.date,
						weights: [],
						totalWeight: 0,
						count: 0,
					};
				}
				acc[dateKey].weights.push(entry.weight);
				acc[dateKey].totalWeight += entry.weight;
				acc[dateKey].count += 1;
				return acc;
			},
			{} as Record<
				string,
				{ date: Date; weights: number[]; totalWeight: number; count: number }
			>,
		);

		// Convert to array with averaged weights
		const processedWeightHistory = Object.values(weightHistory)
			.map((day) => ({
				id: `weight-${format(day.date, "yyyy-MM-dd")}`,
				weight: day.totalWeight / day.count, // Average weight for the day
				date: format(day.date, "yyyy-MM-dd"),
				entries: day.count, // Number of entries for the day
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Get meal entries (last 90 days)
		const mealEntries = await prisma.mealEntry.findMany({
			where: {
				userId: user.id,
				createdAt: {
					gte: ninetyDaysAgo,
				},
			},
			orderBy: { createdAt: "asc" },
		});

		// Calculate streaks (consecutive days with weight entries)
		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
		let lastDate: Date | null = null;

		for (const entry of processedWeightHistory) {
			const entryDate = startOfDay(new Date(entry.date));

			if (lastDate) {
				const diffDays = differenceInDays(entryDate, lastDate);

				if (diffDays === 1) {
					tempStreak++;
				} else if (diffDays > 1) {
					tempStreak = 1;
				}
			} else {
				tempStreak = 1;
			}

			longestStreak = Math.max(longestStreak, tempStreak);
			lastDate = entryDate;
		}

		// Check if current streak is active (last entry within last 2 days)
		if (lastDate) {
			const now = startOfDay(new Date());
			const diffDays = differenceInDays(now, lastDate);

			if (diffDays <= 2) {
				currentStreak = tempStreak;
			}
		}

		// Calculate meal logging streaks
		let currentMealStreak = 0;
		let longestMealStreak = 0;
		let mealTempStreak = 0;
		let lastMealDate: Date | null = null;

		// Group meals by date
		const mealsByDate = mealEntries.reduce(
			(acc, meal) => {
				const date = format(new Date(meal.createdAt), "yyyy-MM-dd");
				if (!acc[date]) acc[date] = [];
				acc[date].push(meal);
				return acc;
			},
			{} as Record<string, typeof mealEntries>,
		);

		const mealDates = Object.keys(mealsByDate).sort();

		for (const dateStr of mealDates) {
			const entryDate = startOfDay(new Date(dateStr));

			if (lastMealDate) {
				const diffDays = differenceInDays(entryDate, lastMealDate);

				if (diffDays === 1) {
					mealTempStreak++;
				} else if (diffDays > 1) {
					mealTempStreak = 1;
				}
			} else {
				mealTempStreak = 1;
			}

			longestMealStreak = Math.max(longestMealStreak, mealTempStreak);
			lastMealDate = entryDate;
		}

		// Check if current meal streak is active
		if (lastMealDate) {
			const now = startOfDay(new Date());
			const diffDays = differenceInDays(now, lastMealDate);

			if (diffDays <= 1) {
				currentMealStreak = mealTempStreak;
			}
		}

		// Calculate daily calorie intake over time
		const calorieHistory = mealDates.map((date) => {
			const dayMeals = mealsByDate[date];
			const totalCalories = dayMeals.reduce(
				(sum, meal) => sum + meal.calories,
				0,
			);
			const totalProtein = dayMeals.reduce(
				(sum, meal) => sum + meal.protein,
				0,
			);
			const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
			const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);

			return {
				date,
				calories: totalCalories,
				protein: totalProtein,
				carbs: totalCarbs,
				fat: totalFat,
				mealsLogged: dayMeals.length,
			};
		});

		// Calculate averages
		const totalDays = mealDates.length;
		const averageCalories =
			totalDays > 0
				? calorieHistory.reduce((sum, day) => sum + day.calories, 0) / totalDays
				: 0;
		const averageProtein =
			totalDays > 0
				? calorieHistory.reduce((sum, day) => sum + day.protein, 0) / totalDays
				: 0;
		const averageCarbs =
			totalDays > 0
				? calorieHistory.reduce((sum, day) => sum + day.carbs, 0) / totalDays
				: 0;
		const averageFat =
			totalDays > 0
				? calorieHistory.reduce((sum, day) => sum + day.fat, 0) / totalDays
				: 0;

		// Calculate weight averages
		const totalWeight = processedWeightHistory.reduce(
			(sum, entry) => sum + entry.weight,
			0,
		);
		const averageWeight =
			processedWeightHistory.length > 0
				? totalWeight / processedWeightHistory.length
				: 0;

		// Calculate BMI if height is available
		let bmi = null;
		if (user.height && user.currentWeight) {
			const heightInMeters = user.height / 100; // assuming height is in cm
			bmi = user.currentWeight / (heightInMeters * heightInMeters);
		}

		// Get goals progress
		const goals = await prisma.goal.findMany({
			where: {
				userId: user.id,
				isActive: true,
			},
		});

		// Calculate weekly stats
		const oneWeekAgo = subDays(new Date(), 7);
		const weeklyMeals = mealEntries.filter((meal) =>
			isAfter(new Date(meal.createdAt), oneWeekAgo),
		);

		const weeklyCalories = weeklyMeals.reduce(
			(sum, meal) => sum + meal.calories,
			0,
		);
		const weeklyProtein = weeklyMeals.reduce(
			(sum, meal) => sum + meal.protein,
			0,
		);
		const weeklyCarbs = weeklyMeals.reduce((sum, meal) => sum + meal.carbs, 0);
		const weeklyFat = weeklyMeals.reduce((sum, meal) => sum + meal.fat, 0);

		// Calculate monthly stats
		const oneMonthAgo = subDays(new Date(), 30);
		const monthlyMeals = mealEntries.filter((meal) =>
			isAfter(new Date(meal.createdAt), oneMonthAgo),
		);

		const monthlyCalories = monthlyMeals.reduce(
			(sum, meal) => sum + meal.calories,
			0,
		);
		const monthlyDays = new Set(
			monthlyMeals.map((meal) =>
				format(new Date(meal.createdAt), "yyyy-MM-dd"),
			),
		).size;

		// Calculate today's nutrition
		const today = format(new Date(), "yyyy-MM-dd");
		const todayMeals = mealsByDate[today] || [];
		const todayCalories = todayMeals.reduce(
			(sum, meal) => sum + meal.calories,
			0,
		);
		const todayProtein = todayMeals.reduce(
			(sum, meal) => sum + meal.protein,
			0,
		);
		const todayCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
		const todayFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

		return NextResponse.json({
			weightHistory: processedWeightHistory,
			calorieHistory,
			streaks: {
				current: currentStreak,
				longest: longestStreak,
				currentMeal: currentMealStreak,
				longestMeal: longestMealStreak,
			},
			averages: {
				weight: averageWeight,
				calories: averageCalories,
				protein: averageProtein,
				carbs: averageCarbs,
				fat: averageFat,
			},
			todayNutrition: {
				calories: todayCalories,
				protein: todayProtein,
				carbs: todayCarbs,
				fat: todayFat,
				mealsLogged: todayMeals.length,
			},
			weeklyStats: {
				calories: weeklyCalories,
				protein: weeklyProtein,
				carbs: weeklyCarbs,
				fat: weeklyFat,
				daysLogged: new Set(
					weeklyMeals.map((meal) =>
						format(new Date(meal.createdAt), "yyyy-MM-dd"),
					),
				).size,
			},
			monthlyStats: {
				calories: monthlyCalories,
				daysLogged: monthlyDays,
				averageDailyCalories:
					monthlyDays > 0 ? monthlyCalories / monthlyDays : 0,
			},
			goals,
			bmi,
			totalMealsLogged: mealEntries.length,
			totalDaysTracked: mealDates.length,
		});
	} catch (error) {
		console.error("Error fetching progress:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
