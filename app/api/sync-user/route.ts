import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user data from Clerk
		const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
			headers: {
				Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
			},
		}).then((res) => res.json());

		// Sync with Prisma
		const user = await prisma.user.upsert({
			where: { clerkId: userId },
			update: {
				name: `${clerkUser.first_name} ${clerkUser.last_name}`,
				email: clerkUser.email_addresses[0]?.email_address,
				avatar: clerkUser.image_url,
				username: clerkUser.username || null,
			},
			create: {
				clerkId: userId,
				name: `${clerkUser.first_name} ${clerkUser.last_name}`,
				email: clerkUser.email_addresses[0]?.email_address,
				avatar: clerkUser.image_url,
				username: clerkUser.username || null,
			},
		});

		return NextResponse.json({ user });
	} catch (error) {
		console.error("Error syncing user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
