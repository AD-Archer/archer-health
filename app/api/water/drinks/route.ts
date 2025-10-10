import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
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

		const drinks = await prisma.drink.findMany({
			where: {
				OR: [
					{ userId: user.id },
					{ userId: null }, // Include default drinks
				],
			},
			orderBy: [
				{ userId: "desc" }, // User's drinks first
				{ name: "asc" },
			],
		});

		const response = NextResponse.json({ drinks });

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
		console.error("Error fetching drinks:", error);
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

		const {
			name,
			type,
			hydrationMultiplier,
			defaultVolumeMl,
			colorHex,
			source,
			metadata,
		} = await request.json();

		if (!name || typeof name !== "string") {
			return NextResponse.json({ error: "Invalid name" }, { status: 400 });
		}

		const drink = await prisma.drink.create({
			data: {
				userId: user.id,
				name,
				type: type || "beverage",
				hydrationMultiplier: hydrationMultiplier ?? 1.0,
				defaultVolumeMl,
				colorHex,
				source: source || "custom",
				metadata,
			},
		});

		const response = NextResponse.json(drink);
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
		console.error("Error creating drink:", error);
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
