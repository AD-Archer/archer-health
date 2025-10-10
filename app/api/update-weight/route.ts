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
		const { weight } = body;

		if (
			typeof weight !== "number" ||
			isNaN(weight) ||
			!isFinite(weight) ||
			weight <= 0
		) {
			return NextResponse.json(
				{ error: "Invalid weight value" },
				{ status: 400 },
			);
		}

		// Get user to check their units preference
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Weight is already in kg from frontend conversion, round to nearest whole number
		const weightInKg = Math.round(weight);

		// Update user weight (stored in kg)
		const updatedUser = await prisma.user.update({
			where: { clerkId: userId },
			data: { currentWeight: weightInKg },
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
