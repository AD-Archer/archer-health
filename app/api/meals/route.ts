import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";
import {
	buildCacheKey,
	getCachedJSON,
	setCachedJSON,
	invalidateCacheByPattern,
} from "../../../lib/cache";
import type { Meal } from "@/lib/generated/prisma";

export async function POST(request: NextRequest) {
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

		await invalidateCacheByPattern(`${buildCacheKey("meals", [user.id])}*`);

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

		const cacheKey = buildCacheKey("meals", [user.id]);
		const cachedMeals = await getCachedJSON<Meal[]>(cacheKey);
		if (cachedMeals) {
			return NextResponse.json(cachedMeals);
		}

		const meals = await prisma.meal.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
		});

		await setCachedJSON(cacheKey, meals);

		return NextResponse.json(meals);
	} catch (error) {
		console.error("Error fetching meals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
