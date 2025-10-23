import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

function formatName(
	firstName?: string | null,
	lastName?: string | null,
	fallback?: string,
) {
	const full = `${firstName || ""} ${lastName || ""}`.trim();
	return full || fallback || "User";
}

export async function ensureUser(clerkId: string) {
	if (!clerkId) {
		throw new Error("Cannot ensure user without a Clerk user id.");
	}

	let user = await prisma.user.findUnique({ where: { clerkId } });
	if (user) {
		return user;
	}

	const clerk = await clerkClient();
	const clerkUser = await clerk.users.getUser(clerkId);

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

	if (!email) {
		throw new Error(
			`Clerk user ${clerkId} is missing an email address, cannot provision Prisma user.`,
		);
	}

	const existingByEmail = await prisma.user.findUnique({
		where: { email },
	});

	const baseData = {
		name: formatName(
			clerkUser.firstName,
			clerkUser.lastName,
			clerkUser.username || undefined,
		),
		email,
		username: clerkUser.username || null,
		avatar: clerkUser.imageUrl || null,
	};

	if (existingByEmail) {
		if (existingByEmail.clerkId === clerkId) {
			return existingByEmail;
		}

		return prisma.user.update({
			where: { id: existingByEmail.id },
			data: {
				clerkId,
				...baseData,
			},
		});
	}

	return prisma.user.create({
		data: {
			clerkId,
			...baseData,
		},
	});
}
