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
			date,
			mealType,
			foodId,
			mealId,
			servings,
			calories,
			protein,
			carbs,
			fat,
			notes,
		} = body;

		// Validate required fields
		if (!date || !mealType || !servings) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (!foodId && !mealId) {
			return NextResponse.json(
				{ error: "Either foodId or mealId must be provided" },
				{ status: 400 },
			);
		}

		let actualFoodId = foodId;

		// If the foodId starts with "usda-", it's a USDA food that needs to be copied to user's foods first
		if (foodId && foodId.startsWith("usda-")) {
			const usdaFdcId = parseInt(foodId.replace("usda-", ""));

			// Check if user already has this USDA food in their collection
			let existingFood = await prisma.food.findFirst({
				where: {
					userId: user.id,
					usdaFdcId: usdaFdcId,
				},
			});

			if (!existingFood) {
				// Fetch the USDA food data
				const usdaFood = await prisma.usdaFood.findUnique({
					where: { fdcId: usdaFdcId },
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
							take: 1,
						},
						foodCategory: true,
					},
				});

				if (!usdaFood) {
					return NextResponse.json(
						{ error: "USDA food not found" },
						{ status: 404 },
					);
				}

				// Extract nutrient values
				const calories =
					usdaFood.nutrients.find((n) => n.nutrient.name === "Energy")
						?.amount || 0;
				const protein =
					usdaFood.nutrients.find((n) => n.nutrient.name === "Protein")
						?.amount || 0;
				const carbs =
					usdaFood.nutrients.find(
						(n) => n.nutrient.name === "Carbohydrate, by difference",
					)?.amount || 0;
				const fat =
					usdaFood.nutrients.find(
						(n) => n.nutrient.name === "Total lipid (fat)",
					)?.amount || 0;
				const fiber =
					usdaFood.nutrients.find(
						(n) => n.nutrient.name === "Fiber, total dietary",
					)?.amount || 0;
				const sugar =
					usdaFood.nutrients.find(
						(n) => n.nutrient.name === "Sugars, total including NLEA",
					)?.amount || 0;
				const sodium =
					usdaFood.nutrients.find((n) => n.nutrient.name === "Sodium, Na")
						?.amount || 0;

				const portion = usdaFood.portions[0];
				const servingSize = portion?.amount?.toString() || "100";
				const servingUnit = portion?.measureUnit?.name || "g";

				// Create the food in user's collection
				existingFood = await prisma.food.create({
					data: {
						name: usdaFood.description,
						calories,
						protein,
						carbs,
						fat,
						fiber,
						sugar,
						sodium,
						servingSize,
						servingUnit,
						isPublic: false, // User's private copy
						category: usdaFood.foodCategory?.description,
						usdaFdcId: usdaFdcId,
						createdBy: "USDA",
						userId: user.id,
					},
				});
			}

			actualFoodId = existingFood.id;
		}

		const mealEntry = await prisma.mealEntry.create({
			data: {
				date,
				mealType,
				foodId: actualFoodId,
				mealId,
				servings: parseFloat(servings),
				calories: parseFloat(calories),
				protein: parseFloat(protein),
				carbs: parseFloat(carbs),
				fat: parseFloat(fat),
				notes,
				userId: user.id,
			},
		});

		return NextResponse.json(mealEntry);
	} catch (error) {
		console.error("Error creating meal entry:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const entryId = searchParams.get("id");

		console.log("DELETE request for entry ID:", entryId);

		if (!entryId) {
			return NextResponse.json(
				{ error: "Entry ID is required" },
				{ status: 400 },
			);
		}

		// Delete the meal entry
		const deletedEntry = await prisma.mealEntry.deleteMany({
			where: {
				id: entryId,
				userId: user.id, // Ensure user can only delete their own entries
			},
		});

		console.log(
			"Delete result - count:",
			deletedEntry.count,
			"for entryId:",
			entryId,
			"userId:",
			user.id,
		);

		if (deletedEntry.count === 0) {
			return NextResponse.json(
				{ error: "Entry not found or not authorized" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting meal entry:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
