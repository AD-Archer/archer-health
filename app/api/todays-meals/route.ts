import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
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

		// Get date from query parameter or default to today
		const { searchParams } = new URL(request.url);
		const requestedDate = searchParams.get("date");
		const targetDate = requestedDate || new Date().toISOString().split("T")[0];

		// Get all meal entries for the target date
		// Handle both date-only format (YYYY-MM-DD) and full datetime format
		const mealEntries = await prisma.mealEntry.findMany({
			where: {
				userId: user.id,
				OR: [{ date: targetDate }, { date: { startsWith: targetDate } }],
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
			date: targetDate,
		});
	} catch (error) {
		console.error("Error fetching today's meals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
