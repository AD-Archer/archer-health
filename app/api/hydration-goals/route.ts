import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");

		let goal = null;
		if (date) {
			// Get goal for specific date
			goal = await prisma.dailyGoal.findFirst({
				where: {
					userId: user.id,
					date: date,
				},
			});
		}

		// If no daily goal, use user's default goal
		const waterGoal = goal
			? goal.goalMl
			: user.waterGoal
				? user.waterGoal * 29.5735
				: 2000; // Convert oz to ml, default 2L

		const response = NextResponse.json({
			waterGoal,
			waterGoalUnit: "ml",
			dailyGoal: goal,
		});

		// Add CORS headers for cross-origin requests from Archer Aqua
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		);

		return response;
	} catch (error) {
		console.error("Error fetching hydration goals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	const response = new NextResponse(null, { status: 200 });
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Authorization, Content-Type",
	);
	return response;
}
