import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const saved = await prisma.savedRecipe.findMany({
			where: { user: { clerkId: userId } },
			select: { recipeId: true },
		});
		return NextResponse.json(saved.map((s) => s.recipeId));
	} catch (err) {
		console.error("GET /api/saved-recipes error", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const body = await request.json();
		const { recipeId } = body as { recipeId?: string };
		if (!recipeId)
			return NextResponse.json({ error: "recipeId required" }, { status: 400 });

		// Resolve local user id
		const user = await prisma.user.findUnique({ where: { clerkId: userId } });
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		await prisma.savedRecipe.upsert({
			where: { userId_recipeId: { userId: user.id, recipeId } },
			create: { userId: user.id, recipeId },
			update: {},
		});
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("POST /api/saved-recipes error", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const body = await request.json();
		const { recipeId } = body as { recipeId?: string };
		if (!recipeId)
			return NextResponse.json({ error: "recipeId required" }, { status: 400 });

		const user = await prisma.user.findUnique({ where: { clerkId: userId } });
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		await prisma.savedRecipe.delete({
			where: { userId_recipeId: { userId: user.id, recipeId } },
		});
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("DELETE /api/saved-recipes error", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
