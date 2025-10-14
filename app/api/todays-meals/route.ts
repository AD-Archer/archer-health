import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
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
