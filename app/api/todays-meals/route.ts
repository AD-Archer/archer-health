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

		// Get all meal entries for today
		const mealEntries = await prisma.mealEntry.findMany({
			where: {
				userId: user.id,
				date: today,
			},
		});

		// Calculate total calories
		const totalCalories = mealEntries.reduce(
			(sum, entry) => sum + entry.calories,
			0,
		);

		return NextResponse.json({
			totalCalories,
			mealEntries,
			date: today,
		});
	} catch (error) {
		console.error("Error fetching today's meals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
