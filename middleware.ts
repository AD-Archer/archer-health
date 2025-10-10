import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect application and API routes except the server-to-server redeem endpoint.
// This allows Archer Aqua (server) to POST to /api/redeem-connection-code without a Clerk session.
const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/goals(.*)",
	"/meal-log(.*)",
	"/recipes(.*)",
	"/progress(.*)",
	"/profile(.*)",
	"/add(.*)",
	"/onboarding(.*)",
	"/privacy(.*)",
	"/terms(.*)",
	"/login(.*)",
	"/signup(.*)",
	"/data(.*)",
	// We purposely do NOT include "/api/(.*)" here so we can handle API protection selectively below.
]);

export default clerkMiddleware(async (auth, req) => {
	// Allow server-to-server calls to redeem connection codes without requiring a Clerk session.
	// Protect other routes that match the protected matcher.
	const path = req.nextUrl.pathname || "";
	if (path === "/api/redeem-connection-code") {
		return;
	}
	if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
