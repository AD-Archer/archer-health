import { NextResponse } from "next/server";

export async function GET() {
	const enabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
	return NextResponse.json({ enabled });
}
