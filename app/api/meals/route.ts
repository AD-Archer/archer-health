import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const body = await request.json();
		const {
			name,
			foods,
			totalCalories,
			totalProtein,
			totalCarbs,
			totalFat,
			isPublic = true,
			imageUrl,
		} = body;

		// Validate required fields
		if (!foods || !Array.isArray(foods) || foods.length === 0) {
			return NextResponse.json(
				{ error: "At least one food is required" },
				{ status: 400 },
			);
		}

		const meal = await prisma.meal.create({
			data: {
				name: name || "Custom Meal",
				foods,
				totalCalories: parseFloat(totalCalories),
				totalProtein: parseFloat(totalProtein),
				totalCarbs: parseFloat(totalCarbs),
				totalFat: parseFloat(totalFat),
				isPublic,
				imageUrl,
				createdBy: userId,
				userId: user.id,
			},
		});

		return NextResponse.json(meal);
	} catch (error) {
		console.error("Error creating meal:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const meals = await prisma.meal.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(meals);
	} catch (error) {
		console.error("Error fetching meals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
