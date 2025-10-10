import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const connectionCode = authHeader.slice(7); // Remove "Bearer "

		// Find user by connection code
		const user = await prisma.user.findFirst({
			where: { archerAquaConnectionCode: connectionCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid connection code" },
				{ status: 401 },
			);
		}

		const {
			amount,
			date,
			notes,
			drinkId,
			label,
			hydrationMultiplier,
			timezone,
			source,
			metadata,
		} = await request.json();

		if (!amount || typeof amount !== "number") {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		const logData = {
			userId: user.id,
			amount,
			date: date ? new Date(date) : new Date(),
			notes,
			drinkId,
			label,
			hydrationMultiplier: hydrationMultiplier ?? 1.0,
			timezone,
			source,
			metadata,
		};

		// Calculate effective amount if multiplier is provided
		if (hydrationMultiplier !== undefined && hydrationMultiplier !== 1.0) {
			(logData as Record<string, unknown>).effectiveAmount =
				amount * hydrationMultiplier;
		}

		// Set daily key for user's timezone
		if (timezone) {
			const logDate = date ? new Date(date) : new Date();
			// Simple daily key calculation - in production you'd want proper timezone handling
			(logData as Record<string, unknown>).dailyKey = logDate
				.toISOString()
				.split("T")[0];
		}

		const log = await prisma.hydrationLog.create({
			data: logData,
			include: {
				drink: true,
			},
		});

		const response = NextResponse.json(log);
		// Add CORS headers for cross-origin requests from Archer Aqua
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		);
		return response;
	} catch (error) {
		console.error("Error creating hydration log:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

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

		const logs = await prisma.hydrationLog.findMany({
			where: { userId: user.id },
			orderBy: { date: "desc" },
			include: {
				drink: true,
			},
		});

		const response = NextResponse.json(logs);
		// Add CORS headers for cross-origin requests from Archer Aqua
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		);
		return response;
	} catch (error) {
		console.error("Error fetching hydration logs:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	const response = new NextResponse(null, { status: 200 });
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Authorization, Content-Type",
	);
	return response;
}
