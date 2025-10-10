import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { DailyGoal } from "../../../lib/generated/prisma";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
	try {
		// Try Clerk authentication first
		let userId: string | null = null;
		try {
			const { userId: clerkUserId } = await auth();
			userId = clerkUserId;
		} catch {
			// Clerk auth failed, try connection code auth
		}

		let user = null;

		if (userId) {
			// Use Clerk user ID
			user = await prisma.user.findUnique({
				where: { clerkId: userId },
			});
		} else {
			// Try connection code authentication
			const authHeader = request.headers.get("authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}

			const connectionCode = authHeader.slice(7);

			user = await prisma.user.findFirst({
				where: { archerAquaConnectionCode: connectionCode },
			});
		}

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid authentication" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");

		let goals: DailyGoal[] = [];
		if (date) {
			// Get goal for specific date
			goals = await prisma.dailyGoal.findMany({
				where: {
					userId: user.id,
					date: date,
				},
			});
		} else {
			// Get all goals
			goals = await prisma.dailyGoal.findMany({
				where: { userId: user.id },
				orderBy: { date: "desc" },
			});
		}

		const response = NextResponse.json({
			goals,
			defaultGoal: user.waterGoal ? user.waterGoal * 29.5735 : null, // Convert oz to ml if needed
		});

		// Add CORS headers for cross-origin requests from Archer Aqua
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, OPTIONS",
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		);
		return response;
	} catch (error) {
		console.error("Error fetching daily goals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const connectionCode = authHeader.slice(7);

		const user = await prisma.user.findFirst({
			where: { archerAquaConnectionCode: connectionCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid connection code" },
				{ status: 401 },
			);
		}

		const { date, goalMl } = await request.json();

		if (!date || !goalMl || typeof goalMl !== "number") {
			return NextResponse.json(
				{ error: "Invalid date or goal" },
				{ status: 400 },
			);
		}

		const goal = await prisma.dailyGoal.upsert({
			where: {
				userId_date: {
					userId: user.id,
					date: date,
				},
			},
			update: {
				goalMl,
			},
			create: {
				userId: user.id,
				date,
				goalMl,
			},
		});

		const response = NextResponse.json(goal);
		// Add CORS headers for cross-origin requests from Archer Aqua
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, OPTIONS",
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		);
		return response;
	} catch (error) {
		console.error("Error creating/updating daily goal:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	const response = new NextResponse(null, { status: 200 });
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, OPTIONS",
	);
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Authorization, Content-Type",
	);
	return response;
}
