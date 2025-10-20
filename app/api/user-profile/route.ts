import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { calculateNutritionNeeds } from "../../../lib/nutrition-calculator";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user data from database
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if macro goals need to be calculated
		let macroGoals = user.macroGoals
			? JSON.parse(user.macroGoals as string)
			: null;
		let dailyCalorieGoal = user.dailyCalorieGoal;
		const hasCompleteProfile =
			user.currentWeight &&
			user.height &&
			user.age &&
			user.gender &&
			user.activityLevel &&
			user.goalType &&
			user.weeklyGoal;

		// Auto-calculate nutrition needs if profile is complete but goals are missing or outdated
		if ((!macroGoals || !dailyCalorieGoal) && hasCompleteProfile) {
			const userForCalculation = {
				id: user.id,
				name: user.name || "",
				email: user.email,
				currentWeight: user.currentWeight as number,
				goalWeight: user.goalWeight || (user.currentWeight as number),
				height: user.height as number,
				age: user.age as number,
				gender: user.gender as "male" | "female" | "other",
				activityLevel: user.activityLevel as
					| "sedentary"
					| "light"
					| "moderate"
					| "active"
					| "very-active",
				goalType: user.goalType as "lose" | "maintain" | "gain",
				weeklyGoal: user.weeklyGoal as number,
				dailyCalorieGoal: user.dailyCalorieGoal || 0,
				macroGoals: { protein: 0, carbs: 0, fat: 0 },
				waterGoal: user.waterGoal || 0,
				isPremium: user.isPremium,
				units: user.units as "metric" | "imperial",
				timezone: user.timezone,
			};

			const nutritionNeeds = calculateNutritionNeeds(userForCalculation);
			macroGoals = nutritionNeeds.macros;
			dailyCalorieGoal = nutritionNeeds.calories;

			// Save the calculated nutrition goals to the database
			await prisma.user.update({
				where: { clerkId: userId },
				data: {
					macroGoals: JSON.stringify(macroGoals),
					dailyCalorieGoal: dailyCalorieGoal,
				},
			});
		}

		// Return weights in metric (kg) - frontend handles conversion
		const userWithConvertedWeights = {
			...user,
			macroGoals,
			dailyCalorieGoal,
			// Weights are already stored in kg, no conversion needed
		};

		return NextResponse.json({ user: userWithConvertedWeights });
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			currentWeight,
			goalWeight,
			startingWeight,
			height,
			age,
			gender,
			activityLevel,
			goalType,
			weeklyGoal,
			units,
			timezone,
			waterGoal,
			waterGoalUnit,
			name,
			email,
			dailyCalorieGoal: incomingDailyCalorieGoal,
			macroGoals: incomingMacroGoals,
		} = body;

		// Get current user to know their units preference for conversion
		const currentUser = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		const userUnits = units || currentUser?.units || "imperial";

		// Weights are already in kg from frontend conversion - just validate and round
		const convertToKg = (weight: unknown) => {
			if (!weight) return undefined;
			const weightNum = parseFloat(weight.toString());
			return Math.round(weightNum); // Round to nearest whole kg
		};

		// Convert weekly goal to kg/week (already in kg from frontend)
		const convertWeeklyGoalToKg = (goal: unknown) => {
			if (!goal) return undefined;
			const goalNum = parseFloat(goal.toString());
			return Math.round(goalNum * 10) / 10; // Round to 1 decimal place
		};

		// Calculate macro goals if we have the necessary data
		let calculatedMacroGoals = null;
		let calculatedDailyCalorieGoal: number | undefined;
		const weightKg = convertToKg(currentWeight);
		const heightCm = height ? parseFloat(height.toString()) : undefined;
		const ageNum = age ? parseInt(age.toString(), 10) : undefined;
		const weeklyGoalKg = convertWeeklyGoalToKg(weeklyGoal);

		if (
			weightKg &&
			heightCm &&
			ageNum &&
			gender &&
			activityLevel &&
			goalType &&
			weeklyGoalKg &&
			!incomingMacroGoals &&
			!incomingDailyCalorieGoal
		) {
			const userForCalculation = {
				id: "",
				name: "",
				email: "",
				currentWeight: weightKg,
				goalWeight: convertToKg(goalWeight) || weightKg,
				height: heightCm,
				age: ageNum,
				gender: gender as "male" | "female" | "other",
				activityLevel: activityLevel as
					| "sedentary"
					| "light"
					| "moderate"
					| "active"
					| "very-active",
				goalType: goalType as "lose" | "maintain" | "gain",
				weeklyGoal: weeklyGoalKg,
				dailyCalorieGoal: 0,
				macroGoals: { protein: 0, carbs: 0, fat: 0 },
				waterGoal: 0,
				isPremium: false,
				units: userUnits as "metric" | "imperial",
				timezone: timezone || "America/New_York",
			};
			const nutritionNeeds = calculateNutritionNeeds(userForCalculation);
			calculatedMacroGoals = nutritionNeeds.macros;
			calculatedDailyCalorieGoal = nutritionNeeds.calories;
		}

		// Use provided values or calculated values
		const finalMacroGoals = incomingMacroGoals || calculatedMacroGoals;
		const finalDailyCalorieGoal =
			incomingDailyCalorieGoal || calculatedDailyCalorieGoal;

		// Update or create user profile data
		const updatedUser = await prisma.user.upsert({
			where: { clerkId: userId },
			update: {
				currentWeight: convertToKg(currentWeight),
				goalWeight: convertToKg(goalWeight),
				startingWeight: convertToKg(startingWeight),
				height: height ? parseFloat(height.toString()) : undefined,
				age: age ? parseInt(age.toString(), 10) : undefined,
				gender,
				activityLevel,
				goalType,
				weeklyGoal: convertWeeklyGoalToKg(weeklyGoal),
				units: userUnits,
				timezone: timezone || "America/New_York",
				waterGoal: waterGoal ? parseFloat(waterGoal.toString()) : undefined,
				waterGoalUnit: waterGoalUnit || "oz",
				name,
				email,
				macroGoals: finalMacroGoals
					? JSON.stringify(finalMacroGoals)
					: undefined,
				dailyCalorieGoal: finalDailyCalorieGoal,
			},
			create: {
				clerkId: userId,
				currentWeight: convertToKg(currentWeight),
				goalWeight: convertToKg(goalWeight),
				startingWeight: convertToKg(startingWeight),
				height: height ? parseFloat(height.toString()) : undefined,
				age: age ? parseInt(age.toString(), 10) : undefined,
				gender,
				activityLevel,
				goalType,
				weeklyGoal: convertWeeklyGoalToKg(weeklyGoal),
				units: userUnits,
				timezone: timezone || "America/New_York",
				waterGoal: waterGoal ? parseFloat(waterGoal.toString()) : undefined,
				waterGoalUnit: waterGoalUnit || "oz",
				name,
				email,
				macroGoals: finalMacroGoals
					? JSON.stringify(finalMacroGoals)
					: undefined,
				dailyCalorieGoal: finalDailyCalorieGoal,
			},
		});

		// If currentWeight was provided, create a weight entry for today
		if (currentWeight && updatedUser.id) {
			const weightInKg = convertToKg(currentWeight);
			if (weightInKg) {
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				await prisma.weightEntry.create({
					data: {
						userId: updatedUser.id,
						weight: weightInKg,
						date: today,
					},
				});
			}
		}

		return NextResponse.json({ user: updatedUser });
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
