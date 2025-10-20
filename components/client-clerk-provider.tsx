"use client";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default function ClientClerkProvider({
	children,
}: {
	children: ReactNode;
}) {
	const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (clerkKey) {
		return (
			<ClerkProvider
				publishableKey={clerkKey}
				signInFallbackRedirectUrl="/dashboard"
			>
				{children}
			</ClerkProvider>
		);
	} else {
		return (
			<>
				<div className="fixed inset-x-0 top-0 bg-red-600 text-white text-sm text-center py-2 z-50">
					WARNING: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Authentication
					is disabled.
				</div>
				{children}
			</>
		);
	}
}
