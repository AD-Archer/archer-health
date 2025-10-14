"use client";

// Force edge runtime to avoid Clerk prerendering issues
export const runtime = "edge";

import { SignUp } from "@clerk/nextjs";

export default function SignUpCatchAllPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
			<div className="w-full max-w-md">
				<SignUp path="/sign-up" routing="path" />
			</div>
		</div>
	);
}
