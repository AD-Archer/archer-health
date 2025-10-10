import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const { connectionCode, archerAquaUserId } = await request.json();

		if (!connectionCode || !archerAquaUserId) {
			return NextResponse.json(
				{ error: "Missing connectionCode or archerAquaUserId" },
				{ status: 400 },
			);
		}

		// Find user with the connection code
		const user = await prisma.user.findFirst({
			where: { archerAquaConnectionCode: connectionCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid connection code" },
				{ status: 404 },
			);
		}

		// Update user with Archer Aqua user ID
		await prisma.user.update({
			where: { id: user.id },
			data: { archerAquaUserId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error redeeming connection code:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
