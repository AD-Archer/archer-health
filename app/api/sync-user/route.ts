import { auth, clerkClient } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { ensureUser } from "../../../lib/ensure-user";
import { prisma } from "../../../lib/prisma";

export async function POST(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const currentUser = await ensureUser(userId);

		const clerk = await clerkClient();
		const clerkUser = await clerk.users.getUser(userId);

		let email: string | undefined;
		if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
			for (const address of clerkUser.emailAddresses) {
				if (address.id === clerkUser.primaryEmailAddressId) {
					email = address.emailAddress;
					break;
				}
			}
			if (!email) {
				email = clerkUser.emailAddresses[0]?.emailAddress;
			}
		}

		const user = await prisma.user.update({
			where: { id: currentUser.id },
			data: {
				name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
					currentUser.name,
				email: email || currentUser.email,
				avatar: clerkUser.imageUrl || currentUser.avatar,
				username: clerkUser.username || currentUser.username,
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
