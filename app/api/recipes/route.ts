import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

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

		const recipes = await prisma.recipe.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(recipes);
	} catch (error) {
		console.error("Error fetching recipes:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
