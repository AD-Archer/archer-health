"use client";

// Use Node.js runtime to ensure Node APIs (like fs) are available
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { SignUp } from "@clerk/nextjs";

export default function SignUpCatchAllPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
			<div className="w-full max-w-md">
				<SignUp path="/sign-up" routing="path" redirectUrl="/dashboard" />
			</div>
		</div>
	);
}
