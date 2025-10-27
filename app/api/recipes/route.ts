import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { Prisma, Recipe } from "@/lib/generated/prisma";
import { ensureUser } from "@/lib/ensure-user";
import { prisma } from "@/lib/prisma";
import { buildCacheKey, getCachedJSON, setCachedJSON } from "@/lib/cache";

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");
		const cuisine = searchParams.get("cuisine");
		const search = searchParams.get("search");
		const caloriesMin = searchParams.get("caloriesMin");
		const caloriesMax = searchParams.get("caloriesMax");
		const timeMax = searchParams.get("timeMax"); // total minutes (prep + cook)
		const calorieBand = searchParams.get("calorieBand"); // low|medium|high
		// Nutrition per serving thresholds (grams)
		const proteinMin = searchParams.get("proteinMin");
		const carbsMax = searchParams.get("carbsMax");
		const fatMax = searchParams.get("fatMax");
		const savedOnly = searchParams.get("saved") === "1";

		const cacheKey = buildCacheKey("recipes", [
			userId,
			category,
			cuisine,
			search,
			caloriesMin,
			caloriesMax,
			timeMax,
			calorieBand,
			proteinMin,
			carbsMax,
			fatMax,
			savedOnly ? "saved" : "public",
		]);

		const cachedRecipes = await getCachedJSON<Recipe[]>(cacheKey);
		if (cachedRecipes) {
			return NextResponse.json(cachedRecipes);
		}

		const where: Prisma.RecipeWhereInput = {
			isPublic: true,
		};

		if (category && category !== "All") {
			where.category = category;
		}

		if (cuisine && cuisine !== "All") {
			where.cuisine = cuisine;
		}

		if (search) {
			where.name = {
				contains: search,
				mode: "insensitive",
			};
		}

		// Calories min/max or by band
		if (calorieBand) {
			// Define simple bands; adjust thresholds as needed
			if (calorieBand === "low") {
				where.calories = { lte: 350 };
			} else if (calorieBand === "medium") {
				where.calories = { gte: 351, lte: 600 };
			} else if (calorieBand === "high") {
				where.calories = { gte: 601 };
			}
		} else if (caloriesMin || caloriesMax) {
			const min = caloriesMin ? Number(caloriesMin) : undefined;
			const max = caloriesMax ? Number(caloriesMax) : undefined;
			if (min !== undefined || max !== undefined) {
				where.calories = {
					...(min !== undefined ? { gte: Math.max(0, Math.floor(min)) } : {}),
					...(max !== undefined ? { lte: Math.max(0, Math.floor(max)) } : {}),
				};
			}
		}

		// Time filter (prep + cook)
		if (timeMax) {
			const maxT = Number(timeMax);
			if (!Number.isNaN(maxT)) {
				// Prisma lacks computed where across two columns. Use AND with constraints that approximate:
				// totalTime = prepTime + cookTime <= timeMax
				// We cannot express addition directly; fallback to filtering later in memory if needed.
			}
		}

		let recipes: Recipe[];

		if (savedOnly) {
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
			recipes = await prisma.recipe.findMany({
				where: {
					...where,
					savedBy: {
						some: { userId: user.id },
					},
				},
			});
		} else {
			recipes = await prisma.recipe.findMany({
				where,
			});
		}

		// Post-filter time (prepTime + cookTime) since Prisma cannot sum in where
		if (timeMax) {
			const maxT = Number(timeMax);
			if (!Number.isNaN(maxT)) {
				recipes = recipes.filter((r) => r.prepTime + r.cookTime <= maxT);
			}
		}

		// Nutrition per serving thresholds from JSON field `nutrition`
		const getNutritionNumber = (value: unknown): number => {
			return typeof value === "number" && Number.isFinite(value) ? value : 0;
		};

		if (proteinMin) {
			const pMin = Number(proteinMin);
			if (!Number.isNaN(pMin)) {
				recipes = recipes.filter(
					(r) =>
						getNutritionNumber(
							(r as unknown as { nutrition?: Record<string, unknown> })
								.nutrition?.protein,
						) >= pMin,
				);
			}
		}
		if (carbsMax) {
			const cMax = Number(carbsMax);
			if (!Number.isNaN(cMax)) {
				recipes = recipes.filter(
					(r) =>
						getNutritionNumber(
							(r as unknown as { nutrition?: Record<string, unknown> })
								.nutrition?.carbs,
						) <= cMax,
				);
			}
		}
		if (fatMax) {
			const fMax = Number(fatMax);
			if (!Number.isNaN(fMax)) {
				recipes = recipes.filter(
					(r) =>
						getNutritionNumber(
							(r as unknown as { nutrition?: Record<string, unknown> })
								.nutrition?.fat,
						) <= fMax,
				);
			}
		}

		// Randomize ordering (Fisher-Yates)
		for (let i = recipes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[recipes[i], recipes[j]] = [recipes[j], recipes[i]];
		}

		await setCachedJSON(cacheKey, recipes, 600);

		return NextResponse.json(recipes);
	} catch (error) {
		console.error("Error fetching recipes:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
