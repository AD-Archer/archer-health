"use client";

// Force edge runtime to avoid Clerk prerendering issues
export const runtime = "edge";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();

	// Redirect if user is already signed in
	useEffect(() => {
		if (isLoaded && user) {
			router.push("/dashboard");
		}
	}, [user, isLoaded, router]);

	// Show loading while checking auth status
	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	// Don't render if user is already signed in
	if (user) {
		return null;
	}
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
							<span className="text-4xl font-bold text-white font-display">
								A
							</span>
						</div>
					</div>
					<CardTitle className="text-2xl font-display">Welcome back</CardTitle>
					<CardDescription>
						Sign in to your Archer Health account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SignInButton mode="modal">
						<button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
							Sign In
						</button>
					</SignInButton>

					<p className="text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="text-primary hover:underline font-medium"
						>
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
