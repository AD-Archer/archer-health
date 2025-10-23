import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";

interface HydrationLogResponse {
	id: string;
	userId: string;
	drinkId?: string;
	label: string;
	volumeMl: number;
	hydrationMultiplier: number;
	effectiveMl: number;
	consumedAt: string;
	consumedAtLocal: string;
	timezone: string;
	dailyKey: string;
	source: string;
	notes?: string;
}

const AQUA_BASE_URL = process.env.AQUA_BASE_URL || "https://aqua.adarcher.app";

export async function POST(_request: NextRequest) {
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

		if (!user?.archerAquaConnectionCode || !user?.archerAquaUserId) {
			return NextResponse.json(
				{ error: "No Archer Aqua connection found" },
				{ status: 400 },
			);
		}

		const headers = {
			Authorization: `Bearer ${user.archerAquaConnectionCode}`,
			"Content-Type": "application/json",
		};

		// Sync hydration logs from Archer Aqua
		try {
			console.log(
				`Fetching hydration stats from: ${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/stats?days=30`,
			);
			const statsResponse = await fetch(
				`${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/stats?days=30`,
				{ headers },
			);
			console.log(`Stats response status: ${statsResponse.status}`);
			if (statsResponse.status === 401) {
				// Clear the connection since it's invalid
				await prisma.user.update({
					where: { id: user.id },
					data: {
						archerAquaConnectionCode: null,
						archerAquaUserId: null,
					},
				});
				return NextResponse.json(
					{
						error:
							"Authentication failed with Archer Aqua. Your connection may have expired. Please disconnect and reconnect your accounts.",
					},
					{ status: 401 },
				);
			}
			if (statsResponse.ok) {
				const stats: {
					dailySummaries: Array<{ logs: HydrationLogResponse[] }>;
				} = await statsResponse.json();
				console.log(`Received stats data:`, JSON.stringify(stats, null, 2));
				let logsProcessed = 0;
				for (const summary of stats.dailySummaries) {
					for (const log of summary.logs) {
						// Check if already exists
						const existing = await prisma.hydrationLog.findFirst({
							where: {
								userId: user.id,
								consumedAt: new Date(log.consumedAt),
								label: log.label,
								source: "archer-aqua",
							},
						});
						if (!existing) {
							await prisma.hydrationLog.create({
								data: {
									userId: user.id,
									label: log.label,
									volumeMl: log.volumeMl,
									hydrationMultiplier: log.hydrationMultiplier,
									effectiveMl: log.effectiveMl,
									consumedAt: new Date(log.consumedAt),
									consumedAtLocal: new Date(log.consumedAtLocal),
									timezone: log.timezone,
									dailyKey: log.dailyKey,
									source: "archer-aqua",
									notes: log.notes,
								},
							});
							logsProcessed++;
						}
					}
				}
				console.log(
					`Processed ${logsProcessed} new hydration logs from Archer Aqua`,
				);
			} else {
				const errorText = await statsResponse.text();
				console.error(`Failed to fetch hydration stats: ${errorText}`);
			}
		} catch (error) {
			console.error("Error syncing hydration logs:", error);
		}

		// Sync daily goals from Archer Aqua
		try {
			const today = new Date().toISOString().split("T")[0];
			console.log(
				`Fetching daily goal from: ${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/goals/daily?date=${today}`,
			);
			const goalsResponse = await fetch(
				`${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/goals/daily?date=${today}`,
				{ headers },
			);
			console.log(`Goals response status: ${goalsResponse.status}`);
			if (goalsResponse.status === 401) {
				return NextResponse.json(
					{
						error:
							"Authentication failed with Archer Aqua. Your connection may have expired. Please disconnect and reconnect your accounts.",
					},
					{ status: 401 },
				);
			}
			if (goalsResponse.ok) {
				const goalData: { goalMl: number } = await goalsResponse.json();
				console.log(`Received goal data:`, goalData);
				await prisma.dailyGoal.upsert({
					where: {
						userId_date: {
							userId: user.id,
							date: today,
						},
					},
					update: {
						goalMl: goalData.goalMl,
					},
					create: {
						userId: user.id,
						date: today,
						goalMl: goalData.goalMl,
					},
				});
				console.log(`Updated daily goal to ${goalData.goalMl}ml`);
			} else {
				const errorText = await goalsResponse.text();
				console.error(`Failed to fetch daily goal: ${errorText}`);
			}
		} catch (error) {
			console.error("Error syncing daily goals:", error);
		}

		// Upload water goal from Archer Health to Archer Aqua
		try {
			const userProfile = await prisma.user.findUnique({
				where: { id: user.id },
				select: { waterGoal: true, waterGoalUnit: true },
			});
			if (userProfile?.waterGoal) {
				const goalInMl =
					userProfile.waterGoalUnit === "oz"
						? userProfile.waterGoal * 29.5735
						: userProfile.waterGoal;
				const today = new Date().toISOString().split("T")[0];
				const goalPayload = { goalMl: goalInMl };
				console.log(`Uploading water goal to Aqua: ${goalPayload.goalMl}ml`);
				const uploadGoalResponse = await fetch(
					`${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/goals/daily?date=${today}`,
					{
						method: "POST",
						headers,
						body: JSON.stringify(goalPayload),
					},
				);
				if (uploadGoalResponse.status === 401) {
					return NextResponse.json(
						{
							error:
								"Authentication failed with Archer Aqua. Your connection may have expired. Please disconnect and reconnect your accounts.",
						},
						{ status: 401 },
					);
				}
				if (!uploadGoalResponse.ok) {
					const errorText = await uploadGoalResponse.text();
					console.error(`Failed to upload water goal: ${errorText}`);
				} else {
					console.log("Successfully uploaded water goal to Archer Aqua");
				}
			}
		} catch (error) {
			console.error("Error uploading water goal:", error);
		}

		// Upload local hydration logs to Archer Aqua
		try {
			const localLogs = await prisma.hydrationLog.findMany({
				where: {
					userId: user.id,
					source: {
						not: "archer-aqua",
					},
				},
			});

			for (const log of localLogs) {
				const payload = {
					label: log.label || "Water",
					volume: {
						value: log.volumeMl,
						unit: "ml",
					},
					hydrationMultiplier: log.hydrationMultiplier,
					consumedAt: log.consumedAt.toISOString(),
					timezone: log.timezone || "UTC",
					source: "archer-health",
					notes: log.notes,
				};

				const uploadResponse = await fetch(
					`${AQUA_BASE_URL}/api/users/${user.archerAquaUserId}/hydration/logs`,
					{
						method: "POST",
						headers,
						body: JSON.stringify(payload),
					},
				);

				if (uploadResponse.status === 401) {
					return NextResponse.json(
						{
							error:
								"Authentication failed with Archer Aqua. Your connection may have expired. Please disconnect and reconnect your accounts.",
						},
						{ status: 401 },
					);
				}

				if (uploadResponse.ok) {
					// Mark as synced
					await prisma.hydrationLog.update({
						where: { id: log.id },
						data: { source: "synced-to-aqua" },
					});
				}
			}
		} catch (error) {
			console.error("Error uploading hydration logs:", error);
		}

		return NextResponse.json({ message: "Sync completed successfully" });
	} catch (error) {
		console.error("Error syncing:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
