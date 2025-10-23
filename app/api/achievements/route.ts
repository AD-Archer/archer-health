import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { presetAchievements } from "../../../app/data/data";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
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

		// Get user's unlocked achievements
		const userAchievements = await prisma.achievement.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				unlockedAt: "desc",
			},
		});

		// Create a map of unlocked achievements
		const unlockedMap = new Map(
			userAchievements.map((ach) => [ach.achievementId, ach]),
		);

		// Combine preset achievements with unlock status
		const achievements = presetAchievements.map((preset) => ({
			...preset,
			achievementId: preset.id,
			isUnlocked: unlockedMap.has(preset.id),
			unlockedAt: unlockedMap.get(preset.id)?.unlockedAt,
		}));

		return NextResponse.json({ achievements });
	} catch (error) {
		console.error("Error fetching achievements:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
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

		const body = await request.json();
		const { achievementId } = body;

		// Validate achievement exists
		const preset = presetAchievements.find((ach) => ach.id === achievementId);
		if (!preset) {
			return NextResponse.json(
				{ error: "Achievement not found" },
				{ status: 404 },
			);
		}

		// Check if already unlocked
		const existing = await prisma.achievement.findUnique({
			where: {
				userId_achievementId: {
					userId: user.id,
					achievementId,
				},
			},
		});

		if (existing) {
			return NextResponse.json(
				{ error: "Achievement already unlocked" },
				{ status: 400 },
			);
		}

		// For manual achievements, allow direct unlocking
		// For automatic achievements, this should be called by the system
		if (preset.triggerType === "manual") {
			const achievement = await prisma.achievement.create({
				data: {
					userId: user.id,
					achievementId,
					name: preset.name,
					description: preset.description,
					icon: preset.icon,
					category: preset.category,
				},
			});

			return NextResponse.json({ achievement });
		}

		// For automatic achievements, return error (should be unlocked by system)
		return NextResponse.json(
			{ error: "Achievement must be unlocked automatically" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("Error unlocking achievement:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
