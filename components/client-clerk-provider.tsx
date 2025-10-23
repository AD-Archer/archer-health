"use client";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default function ClientClerkProvider({
	publishableKey,
	children,
}: {
	publishableKey: string;
	children: ReactNode;
}) {
	return (
		<ClerkProvider
			publishableKey={publishableKey}
			signInFallbackRedirectUrl="/dashboard"
		>
			{children}
		</ClerkProvider>
	);
}
