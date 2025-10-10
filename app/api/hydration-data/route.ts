import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user data from database
		const { prisma } = await import("../../../lib/prisma");
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if connected to Archer Aqua
		if (!user.archerAquaConnectionCode || !user.archerAquaUserId) {
			return NextResponse.json({
				connected: false,
				logs: [],
				goal: user.waterGoal || 64,
			});
		}

		// Fetch data from Archer Aqua's backend
		const aquaUrl = process.env.ARCHER_AQUA_URL || "http://localhost:8080";

		try {
			// Fetch hydration stats from Archer Aqua
			const statsResponse = await fetch(
				`${aquaUrl}/api/users/${user.archerAquaUserId}/hydration/stats?timezone=America/New_York&days=1`,
				{
					headers: {
						Authorization: `Bearer ${user.archerAquaConnectionCode}`,
					},
				},
			);

			if (statsResponse.ok) {
				const statsData = await statsResponse.json();

				// Get today's summary
				const today = new Date().toISOString().split("T")[0];
				const todaySummary = statsData.dailySummaries?.find(
					(summary: { date: string }) => summary.date.startsWith(today),
				);

				if (todaySummary) {
					// Convert logs to the expected format
					const convertedLogs =
						todaySummary.logs?.map(
							(log: {
								id: string;
								volume: { value: number };
								consumedAt?: string;
								label?: string;
							}) => ({
								id: log.id,
								amount: log.volume.value, // Archer Aqua returns in ml
								date: log.consumedAt || todaySummary.date,
								notes: log.label || "Drink",
							}),
						) || [];

					// Convert goal from ml to oz
					const goalInOz = todaySummary.goalVolumeMl
						? todaySummary.goalVolumeMl / 29.5735
						: 64;

					return NextResponse.json({
						connected: true,
						logs: convertedLogs,
						goal: goalInOz,
					});
				}
			}
		} catch (error) {
			console.error("Failed to fetch from Archer Aqua:", error);
		}

		// Fall back to local data
		const logs = await prisma.hydrationLog.findMany({
			where: { userId: user.id },
			orderBy: { date: "desc" },
		});

		return NextResponse.json({
			connected: false,
			logs: logs.map((log) => ({
				id: log.id,
				amount: log.amount,
				date: log.date.toISOString(),
				notes: log.notes,
			})),
			goal: user.waterGoal || 64,
		});
	} catch (error) {
		console.error("Error fetching hydration data:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
