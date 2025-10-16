import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { Food } from "../../../app/data/data";
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
		if (
			!name ||
			!calories ||
			!protein ||
			!carbs ||
			!fat ||
			!servingSize ||
			!servingUnit
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const food = await prisma.food.create({
			data: {
				name,
				calories: parseFloat(calories),
				protein: parseFloat(protein),
				carbs: parseFloat(carbs),
				fat: parseFloat(fat),
				fiber: fiber ? parseFloat(fiber) : null,
				sugar: sugar ? parseFloat(sugar) : null,
				sodium: sodium ? parseFloat(sodium) : null,
				servingSize,
				servingUnit,
				isPublic,
				category,
				createdBy: userId,
				userId: user.id,
			},
		});

		return NextResponse.json(food);
	} catch (error) {
		console.error("Error creating food:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
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
		const query = searchParams.get("q");
		const limit = parseInt(searchParams.get("limit") || "50", 10);

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

		return NextResponse.json(foods);
	} catch (error) {
		console.error("Error fetching foods:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
