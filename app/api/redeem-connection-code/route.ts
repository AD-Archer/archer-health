import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const { connectionCode, archerAquaUserId } = await request.json();

		if (!connectionCode || !archerAquaUserId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Find user by connection code
		const user = await prisma.user.findUnique({
			where: { archerAquaConnectionCode: connectionCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid connection code" },
				{ status: 404 },
			);
		}

		// Link accounts (you might want to add a field for archerAquaUserId)
		// For now, just mark as connected
		await prisma.user.update({
			where: { id: user.id },
			data: { archerAquaConnectionCode: null }, // Clear code after use
		});

		return NextResponse.json({ success: true, archerHealthUserId: user.id });
	} catch (error) {
		console.error("Error redeeming connection code:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
