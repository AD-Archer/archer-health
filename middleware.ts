import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default clerkKey
	? clerkMiddleware(
			isProduction
				? {
						authorizedParties: [
							"https://health.adarcher.app",
							"http://localhost:3000",
						],
					}
				: {},
		)
	: () => {
			// No Clerk, just pass through
			return NextResponse.next();
		};

export const config = {
	matcher: [
		// Skip Next.js internals and public/catch-all routes (auth, privacy, terms)
		"/((?!_next|sign-in|sign-up|privacy|terms).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
