import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Ensure this route runs on the server at request time so process.env is
// evaluated when the container is running. This allows providing a
// runtime `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` without requiring it at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
	const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	if (!clerkKey) {
		// No Clerk key, redirect to landing
		redirect("/landing");
	}

	const { userId } = await auth();

	if (userId) {
		// User is logged in, redirect to dashboard
		redirect("/dashboard");
	} else {
		// User is not logged in, redirect to landing page
		redirect("/landing");
	}
}
