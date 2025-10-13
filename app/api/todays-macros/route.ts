import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find or create user
		let user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			// Create basic user record if it doesn't exist
			try {
				const clerkUser = await fetch(
					`https://api.clerk.com/v1/users/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
						},
					},
				).then((res) => res.json());

				user = await prisma.user.create({
					data: {
						clerkId: userId,
						name:
							`${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
							"User",
						email: clerkUser.email_addresses?.[0]?.email_address || null,
						avatar: clerkUser.image_url || null,
						username: clerkUser.username || null,
					},
				});
			} catch (clerkError) {
				console.error("Error fetching user from Clerk:", clerkError);
				return NextResponse.json(
					{ error: "Failed to create user record" },
					{ status: 500 },
				);
			}
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
				food: true, // Include food details if it's a direct food entry
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
			if (entry.foodId && entry.food) {
				// Direct food entry
				const servings = entry.servings;
				totalMacros.calories += entry.food.calories * servings;
				totalMacros.protein += entry.food.protein * servings;
				totalMacros.carbs += entry.food.carbs * servings;
				totalMacros.fat += entry.food.fat * servings;

				// Basic nutrient calculation (in a real app, foods would have nutrient data)
				// For now, using rough estimates based on food categories
				if (
					entry.food.category?.toLowerCase().includes("fruit") ||
					entry.food.category?.toLowerCase().includes("vegetable")
				) {
					totalNutrients.vitaminC += 10 * servings; // Rough estimate
					totalNutrients.fiber += 2 * servings;
				}
				if (entry.food.category?.toLowerCase().includes("dairy")) {
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
