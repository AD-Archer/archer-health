"use client";

// Force edge runtime to avoid Clerk prerendering issues
export const runtime = "edge";

import { SignIn } from "@clerk/nextjs";

export default function SignInCatchAllPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
			<div className="w-full max-w-md">
				<SignIn path="/sign-in" routing="path" />
			</div>
		</div>
	);
}
