import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get today's date in YYYY-MM-DD format
		const today = new Date().toISOString().split("T")[0];

		// Get all meal entries for today with food details
		const mealEntries = await prisma.mealEntry.findMany({
			where: {
				userId: user.id,
				date: today,
			},
			include: {
				Food: true, // Include food details if it's a direct food entry
			},
		});

		// Calculate macros from meal entries
		const totalMacros = {
			calories: 0,
			protein: 0,
			carbs: 0,
			fat: 0,
		};

		// Calculate nutrients (basic implementation - would need more comprehensive nutrient data)
		const totalNutrients = {
			vitaminC: 0,
			calcium: 0,
			iron: 0,
			fiber: 0,
		};

		for (const entry of mealEntries) {
			if (entry.foodId && entry.Food) {
				// Direct food entry
				const servings = entry.servings;
				totalMacros.calories += entry.Food.calories * servings;
				totalMacros.protein += entry.Food.protein * servings;
				totalMacros.carbs += entry.Food.carbs * servings;
				totalMacros.fat += entry.Food.fat * servings;

				// Basic nutrient calculation (in a real app, foods would have nutrient data)
				// For now, using rough estimates based on food categories
				if (
					entry.Food.category?.toLowerCase().includes("fruit") ||
					entry.Food.category?.toLowerCase().includes("vegetable")
				) {
					totalNutrients.vitaminC += 10 * servings; // Rough estimate
					totalNutrients.fiber += 2 * servings;
				}
				if (entry.Food.category?.toLowerCase().includes("dairy")) {
					totalNutrients.calcium += 150 * servings;
				}
			} else if (entry.mealId) {
				// Meal entry - would need to calculate from meal composition
				// For now, just add the stored values
				totalMacros.calories += entry.calories;
				totalMacros.protein += entry.protein;
				totalMacros.carbs += entry.carbs;
				totalMacros.fat += entry.fat;
			}
		}

		return NextResponse.json({
			macros: totalMacros,
			nutrients: totalNutrients,
			date: today,
		});
	} catch (error) {
		console.error("Error fetching today's macros:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
