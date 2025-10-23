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

		// Get all goals for the user (active, completed, archived)
		const goals = await prisma.goal.findMany({
			where: {
				userId: user.id,
			},
			orderBy: [
				{ isActive: "desc" }, // Active goals first
				{ isArchived: "asc" }, // Then non-archived
				{ updatedAt: "desc" }, // Most recently updated first
			],
		});

		return NextResponse.json({ goals });
	} catch (error) {
		console.error("Error fetching goals:", error);
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
		const {
			type,
			name,
			target,
			unit,
			deadline,
			current = 0,
			isActive = true,
			isArchived = false,
		} = body;

		// Validate required fields
		if (!type || !name || !unit) {
			return NextResponse.json(
				{ error: "Missing required fields: type, name, unit" },
				{ status: 400 },
			);
		}

		const targetValue = parseFloat(target);
		const currentValue = parseFloat(current || 0);

		if (Number.isNaN(targetValue) || targetValue <= 0) {
			return NextResponse.json(
				{ error: "Invalid target value" },
				{ status: 400 },
			);
		}

		if (Number.isNaN(currentValue) || currentValue < 0) {
			return NextResponse.json(
				{ error: "Invalid current value" },
				{ status: 400 },
			);
		}

		const goal = await prisma.goal.create({
			data: {
				type,
				name,
				target: targetValue,
				current: currentValue,
				unit,
				deadline: deadline || null,
				isActive: Boolean(isActive),
				isArchived: Boolean(isArchived),
				userId: user.id,
			},
		});

		return NextResponse.json({ goal });
	} catch (error) {
		console.error("Error creating goal:", error);
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
		const {
			id,
			type,
			name,
			target,
			unit,
			deadline,
			current,
			isActive,
			isArchived,
		} = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Goal ID is required" },
				{ status: 400 },
			);
		}

		// Prepare update data
		const updateData: {
			type?: string;
			name?: string;
			target?: number;
			current?: number;
			unit?: string;
			deadline?: string | null;
			isActive?: boolean;
			isArchived?: boolean;
			completedAt?: Date;
		} = {};

		// Validate and prepare data
		if (type !== undefined) {
			if (!type) {
				return NextResponse.json(
					{ error: "Type cannot be empty" },
					{ status: 400 },
				);
			}
			updateData.type = type;
		}
		if (name !== undefined) {
			if (!name.trim()) {
				return NextResponse.json(
					{ error: "Name cannot be empty" },
					{ status: 400 },
				);
			}
			updateData.name = name;
		}
		if (target !== undefined) {
			const targetValue = parseFloat(target);
			if (Number.isNaN(targetValue) || targetValue <= 0) {
				return NextResponse.json(
					{ error: "Invalid target value" },
					{ status: 400 },
				);
			}
			updateData.target = targetValue;
		}
		if (current !== undefined) {
			const currentValue = parseFloat(current);
			if (Number.isNaN(currentValue) || currentValue < 0) {
				return NextResponse.json(
					{ error: "Invalid current value" },
					{ status: 400 },
				);
			}
			updateData.current = currentValue;
		}
		if (unit !== undefined) {
			if (!unit.trim()) {
				return NextResponse.json(
					{ error: "Unit cannot be empty" },
					{ status: 400 },
				);
			}
			updateData.unit = unit;
		}
		if (deadline !== undefined) updateData.deadline = deadline || null;
		if (isActive !== undefined) updateData.isActive = Boolean(isActive);
		if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

		// If marking as inactive (completed), set completedAt
		if (isActive === false && updateData.isActive !== undefined) {
			updateData.completedAt = new Date();
		}

		const goal = await prisma.goal.update({
			where: {
				id,
				userId: user.id, // Ensure user can only update their own goals
			},
			data: updateData,
		});

		return NextResponse.json({ goal });
	} catch (error) {
		console.error("Error updating goal:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const goalId = searchParams.get("id");

		if (!goalId) {
			return NextResponse.json(
				{ error: "Goal ID is required" },
				{ status: 400 },
			);
		}

		await prisma.goal.delete({
			where: {
				id: goalId,
				userId: user.id, // Ensure user can only delete their own goals
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting goal:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
