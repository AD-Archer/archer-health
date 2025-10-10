import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
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

		// Return weights in metric (kg) - frontend handles conversion
		const userWithConvertedWeights = {
			...user,
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
			return Math.round(goalNum); // Round to nearest whole kg
		};

		// Update or create user profile data
		const updatedUser = await prisma.user.upsert({
			where: { clerkId: userId },
			update: {
				currentWeight: convertToKg(currentWeight),
				goalWeight: convertToKg(goalWeight),
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
			},
			create: {
				clerkId: userId,
				currentWeight: convertToKg(currentWeight),
				goalWeight: convertToKg(goalWeight),
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
			},
		});

		return NextResponse.json({ user: updatedUser });
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
