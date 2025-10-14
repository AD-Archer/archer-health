import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
	authorizedParties: ["https://health.adarcher.app"],
});

export const config = {
	matcher: [
		// Skip Next.js internals and public/catch-all routes (auth, privacy, terms)
		"/((?!_next|sign-in|sign-up|privacy|terms).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
