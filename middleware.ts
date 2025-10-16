import { clerkMiddleware } from "@clerk/nextjs/server";
const isProduction = process.env.NODE_ENV === "production";

export default clerkMiddleware(
	isProduction
		? {
				authorizedParties: ["https://health.adarcher.app", "http://localhost:3000"],
			}
		: {},
);

export const config = {
	matcher: [
		// Skip Next.js internals and public/catch-all routes (auth, privacy, terms)
		"/((?!_next|sign-in|sign-up|privacy|terms).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
