import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { weight, date } = body;

		if (
			typeof weight !== "number" ||
			Number.isNaN(weight) ||
			!Number.isFinite(weight) ||
			weight <= 0
		) {
			return NextResponse.json(
				{ error: "Invalid weight value" },
				{ status: 400 },
			);
		}

		// Validate date if provided
		let entryDate: Date;
		if (date) {
			entryDate = new Date(date);
			if (Number.isNaN(entryDate.getTime())) {
				return NextResponse.json(
					{ error: "Invalid date format" },
					{ status: 400 },
				);
			}
			// Don't allow future dates
			const today = new Date();
			today.setHours(23, 59, 59, 999);
			if (entryDate > today) {
				return NextResponse.json(
					{ error: "Cannot log weight for future dates" },
					{ status: 400 },
				);
			}
		} else {
			entryDate = new Date();
		}
		entryDate.setHours(0, 0, 0, 0);

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

		// Weight is already in kg from frontend conversion, round to nearest whole number
		const weightInKg = Math.round(weight);

		// Update user weight (stored in kg)
		const updatedUser = await prisma.user.update({
			where: { clerkId: userId },
			data: { currentWeight: weightInKg },
		});

		// Create a new weight entry for the specified date
		await prisma.weightEntry.create({
			data: {
				userId: user.id,
				weight: weightInKg,
				date: entryDate,
			},
		});

		// Return the weight in kg (frontend handles conversion to display units)
		return NextResponse.json({
			user: {
				...updatedUser,
				currentWeight: weightInKg, // Return in kg
			},
		});
	} catch (error) {
		console.error("Error updating weight:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
