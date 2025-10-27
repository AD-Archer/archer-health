import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { Food } from "../../../app/data/data";
import { ensureUser } from "../../../lib/ensure-user";
import {
	buildCacheKey,
	getCachedJSON,
	setCachedJSON,
	invalidateCacheByPattern,
} from "../../../lib/cache";
import { prisma } from "../../../lib/prisma";

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
			calories,
			protein,
			carbs,
			fat,
			fiber,
			sugar,
			sodium,
			servingSize,
			servingUnit,
			isPublic = true,
			category,
		} = body;

		// Validate required fields
		if (!calories || parseFloat(calories) <= 0) {
			return NextResponse.json(
				{ error: "Calories are required and must be greater than 0" },
				{ status: 400 },
			);
		}

		const food = await prisma.food.create({
			data: {
				name: name || "Unnamed Food",
				calories: parseFloat(calories),
				protein: protein ? parseFloat(protein) : 0,
				carbs: carbs ? parseFloat(carbs) : 0,
				fat: fat ? parseFloat(fat) : 0,
				fiber: fiber ? parseFloat(fiber) : null,
				sugar: sugar ? parseFloat(sugar) : null,
				sodium: sodium ? parseFloat(sodium) : null,
				servingSize: servingSize || "1",
				servingUnit: servingUnit || "g",
				isPublic,
				category,
				createdBy: userId,
				userId: user.id,
			},
		});

		await invalidateCacheByPattern(`${buildCacheKey("foods", [user.id])}*`);

		return NextResponse.json(food);
	} catch (error) {
		console.error("Error creating food:", error);
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
			id,
			name,
			calories,
			protein,
			carbs,
			fat,
			fiber,
			sugar,
			sodium,
			servingSize,
			servingUnit,
			isPublic = true,
			category,
		} = body;

		// Validate required fields
		if (!id) {
			return NextResponse.json(
				{ error: "Food ID is required" },
				{ status: 400 },
			);
		}

		if (!calories || parseFloat(calories) <= 0) {
			return NextResponse.json(
				{ error: "Calories are required and must be greater than 0" },
				{ status: 400 },
			);
		}

		// Verify the food exists and belongs to the user
		const existingFood = await prisma.food.findFirst({
			where: {
				id,
				userId: user.id,
			},
		});

		if (!existingFood) {
			return NextResponse.json(
				{ error: "Food not found or access denied" },
				{ status: 404 },
			);
		}

		// Create a new food entry instead of updating the existing one
		// This preserves existing meal entries that reference the old food
		const newFood = await prisma.food.create({
			data: {
				name: name || "Unnamed Food",
				calories: parseFloat(calories),
				protein: protein ? parseFloat(protein) : 0,
				carbs: carbs ? parseFloat(carbs) : 0,
				fat: fat ? parseFloat(fat) : 0,
				fiber: fiber ? parseFloat(fiber) : null,
				sugar: sugar ? parseFloat(sugar) : null,
				sodium: sodium ? parseFloat(sodium) : null,
				servingSize: servingSize || "1",
				servingUnit: servingUnit || "g",
				isPublic,
				category,
				createdBy: userId,
				userId: user.id,
			},
		});

		await invalidateCacheByPattern(`${buildCacheKey("foods", [user.id])}*`);

		return NextResponse.json(newFood);
	} catch (error) {
		console.error("Error updating food:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");
		const limit = parseInt(searchParams.get("limit") || "50", 10);

		// For search queries, allow unauthenticated access to search USDA foods
		if (query) {
			const cacheKey = buildCacheKey("foods", [
				"public",
				`query:${query}`,
				`limit:${limit}`,
			]);

			const cachedFoods = await getCachedJSON<Food[]>(cacheKey);
			if (cachedFoods) {
				return NextResponse.json(cachedFoods);
			}

			// Search USDA foods (public data)
			const usdaFoods = await prisma.usdaFood.findMany({
				where: {
					description: {
						contains: query,
						mode: "insensitive",
					},
				},
				include: {
					nutrients: {
						include: {
							nutrient: true,
						},
					},
					portions: {
						include: {
							measureUnit: true,
						},
						take: 1, // Get first portion for serving info
					},
				},
				take: limit,
			});

			const transformedFoods: Food[] = usdaFoods.map((food) => ({
				id: `usda-${food.fdcId}`,
				name: food.description,
				calories: food.nutrients.find((n) => n.nutrient.name === "Energy")?.amount || 0,
				protein: food.nutrients.find((n) => n.nutrient.name === "Protein")?.amount || 0,
				carbs: food.nutrients.find((n) => n.nutrient.name === "Carbohydrate, by difference")?.amount || 0,
				fat: food.nutrients.find((n) => n.nutrient.name === "Total lipid (fat)")?.amount || 0,
				fiber: food.nutrients.find((n) => n.nutrient.name === "Fiber, total dietary")?.amount || 0,
				sugar: food.nutrients.find((n) => n.nutrient.name === "Sugars, total")?.amount || 0,
				sodium: food.nutrients.find((n) => n.nutrient.name === "Sodium, Na")?.amount || 0,
				servingSize: (food.portions[0]?.amount || 100).toString(),
				servingUnit: food.portions[0]?.measureUnit?.name || "g",
				isPublic: true,
				createdBy: "USDA",
				source: "usda" as const,
				category: "USDA Food", // food.foodCategoryId doesn't have description in the include
			}));

			await setCachedJSON(cacheKey, transformedFoods);
			return NextResponse.json(transformedFoods);
		}

		// For non-search requests, require authentication
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

		const cacheKey = buildCacheKey("foods", [
			user.id,
			query ? `query:${query}` : "all",
			`limit:${limit}`,
		]);

		const cachedFoods = await getCachedJSON<Food[]>(cacheKey);
		if (cachedFoods) {
			return NextResponse.json(cachedFoods);
		}

		let foods: Food[];

		if (query) {
			// Search both user foods and USDA foods
			const [userFoods, usdaFoods] = await Promise.all([
				prisma.food.findMany({
					where: {
						userId: user.id,
						name: {
							contains: query,
							mode: "insensitive",
						},
					},
					take: limit,
				}),
				prisma.usdaFood.findMany({
					where: {
						description: {
							contains: query,
							mode: "insensitive",
						},
					},
					include: {
						nutrients: {
							include: {
								nutrient: true,
							},
						},
						portions: {
							include: {
								measureUnit: true,
							},
							take: 1, // Get first portion for serving info
						},
						foodCategory: true,
					},
					take: limit,
				}),
			]);

			// Transform USDA foods to match Food interface
			const transformedUsdaFoods = usdaFoods.map((food) => {
				const calories =
					food.nutrients.find((n) => n.nutrient.name === "Energy")?.amount || 0;
				const protein =
					food.nutrients.find((n) => n.nutrient.name === "Protein")?.amount ||
					0;
				const carbs =
					food.nutrients.find(
						(n) => n.nutrient.name === "Carbohydrate, by difference",
					)?.amount || 0;
				const fat =
					food.nutrients.find((n) => n.nutrient.name === "Total lipid (fat)")
						?.amount || 0;
				const fiber =
					food.nutrients.find((n) => n.nutrient.name === "Fiber, total dietary")
						?.amount || 0;
				const sugar =
					food.nutrients.find(
						(n) => n.nutrient.name === "Sugars, total including NLEA",
					)?.amount || 0;
				const sodium =
					food.nutrients.find((n) => n.nutrient.name === "Sodium, Na")
						?.amount || 0;

				const portion = food.portions[0];
				const servingSize = portion?.amount?.toString() || "100";
				const servingUnit = portion?.measureUnit?.name || "g";

				return {
					id: `usda-${food.fdcId}`,
					name: food.description,
					calories,
					protein,
					carbs,
					fat,
					fiber,
					sugar,
					sodium,
					servingSize,
					servingUnit,
					isPublic: true,
					createdBy: "USDA",
					category: food.foodCategory?.description,
					source: "usda" as const,
					isVerified: true,
				};
			});

			// Combine and prioritize USDA foods
			const transformedUserFoods = userFoods.map((food) => ({
				...food,
				source: "user" as const,
				isVerified: false,
				fiber: food.fiber || undefined,
				sugar: food.sugar || undefined,
				sodium: food.sodium || undefined,
				category: food.category || undefined,
			}));

			foods = [...transformedUsdaFoods, ...transformedUserFoods];
		} else {
			// Get user's foods only, allow limit
			const userFoods = await prisma.food.findMany({
				where: { userId: user.id },
				orderBy: { createdAt: "desc" },
				take: limit,
			});

			foods = userFoods.map((food) => ({
				...food,
				source: "user" as const,
				isVerified: false,
				fiber: food.fiber || undefined,
				sugar: food.sugar || undefined,
				sodium: food.sodium || undefined,
				category: food.category || undefined,
			}));
		}

		await setCachedJSON(cacheKey, foods, query ? 120 : 300);

		return NextResponse.json(foods);
	} catch (error) {
		console.error("Error fetching foods:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
