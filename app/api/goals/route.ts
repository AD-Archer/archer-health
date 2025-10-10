import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
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

		// Get all active goals for the user
		const goals = await prisma.goal.findMany({
			where: {
				userId: user.id,
				isActive: true,
			},
		});

		return NextResponse.json({ goals });
	} catch (error) {
		console.error("Error fetching goals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
