import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
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
		const settings = await prisma.privacySettings.findUnique({
			where: { userId: user.id },
		});
		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error fetching privacy settings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
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
		const { profileVisibility, activitySharing, dataCollection } = body;
		const settings = await prisma.privacySettings.upsert({
			where: { userId: user.id },
			update: {
				profileVisibility:
					typeof profileVisibility === "boolean" ? profileVisibility : true,
				activitySharing:
					typeof activitySharing === "boolean" ? activitySharing : false,
				dataCollection:
					typeof dataCollection === "boolean" ? dataCollection : true,
			},
			create: {
				userId: user.id,
				profileVisibility:
					typeof profileVisibility === "boolean" ? profileVisibility : true,
				activitySharing:
					typeof activitySharing === "boolean" ? activitySharing : false,
				dataCollection:
					typeof dataCollection === "boolean" ? dataCollection : true,
			},
		});
		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error updating privacy settings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
