import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(_request: NextRequest) {
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find or create user
		let user = await prisma.user.findUnique({
			where: { clerkId },
		});

		if (!user) {
			// Create basic user record if it doesn't exist
			try {
				const clerkUser = await fetch(
					`https://api.clerk.com/v1/users/${clerkId}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
						},
					},
				).then((res) => res.json());

				user = await prisma.user.create({
					data: {
						clerkId,
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

		const settings = await prisma.notificationSettings.findUnique({
			where: { userId: user.id },
		});
		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error fetching notification settings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find or create user
		let user = await prisma.user.findUnique({
			where: { clerkId },
		});

		if (!user) {
			// Create basic user record if it doesn't exist
			try {
				const clerkUser = await fetch(
					`https://api.clerk.com/v1/users/${clerkId}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
						},
					},
				).then((res) => res.json());

				user = await prisma.user.create({
					data: {
						clerkId,
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

		const body = await request.json();
		const {
			mealReminders,
			workoutReminders,
			goalAchievements,
			weeklyReports,
			emailNotifications,
			pushNotifications,
		} = body;

		console.log("Saving notification settings for user:", user.id, body);

		const settings = await prisma.notificationSettings.upsert({
			where: { userId: user.id },
			update: {
				mealReminders:
					typeof mealReminders === "boolean" ? mealReminders : true,
				workoutReminders:
					typeof workoutReminders === "boolean" ? workoutReminders : true,
				goalAchievements:
					typeof goalAchievements === "boolean" ? goalAchievements : true,
				weeklyReports:
					typeof weeklyReports === "boolean" ? weeklyReports : true,
				emailNotifications:
					typeof emailNotifications === "boolean" ? emailNotifications : false,
				pushNotifications:
					typeof pushNotifications === "boolean" ? pushNotifications : true,
			},
			create: {
				userId: user.id,
				mealReminders:
					typeof mealReminders === "boolean" ? mealReminders : true,
				workoutReminders:
					typeof workoutReminders === "boolean" ? workoutReminders : true,
				goalAchievements:
					typeof goalAchievements === "boolean" ? goalAchievements : true,
				weeklyReports:
					typeof weeklyReports === "boolean" ? weeklyReports : true,
				emailNotifications:
					typeof emailNotifications === "boolean" ? emailNotifications : false,
				pushNotifications:
					typeof pushNotifications === "boolean" ? pushNotifications : true,
			},
		});

		console.log("Successfully saved notification settings:", settings);

		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error updating notification settings:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
