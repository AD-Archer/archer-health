"use client";

// Force edge runtime to avoid Clerk prerendering issues
export const runtime = "edge";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileHeader } from "./components/profile-header";
import { ProfileStats } from "./components/profile-stats";
import { SettingsSection } from "./components/settings-section";

interface UserProfile {
	id: string;
	clerkId: string;
	currentWeight: number | null;
	goalWeight: number | null;
	height: number | null;
	age: number | null;
}

export default function ProfilePage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const [isCheckingProfile, setIsCheckingProfile] = useState(true);

	useEffect(() => {
		if (isLoaded && user) {
			// Check if user has completed their profile
			fetch("/api/user-profile")
				.then((res) => res.json())
				.then((data) => {
					if (data.user) {
						const profile = data.user as UserProfile;
						// Check if essential profile information is missing
						const hasCompletedProfile =
							profile.currentWeight !== null &&
							profile.goalWeight !== null &&
							profile.height !== null &&
							profile.age !== null;

						if (!hasCompletedProfile) {
							router.push("/onboarding");
							return;
						}
					} else {
						// No profile data exists, redirect to onboarding
						router.push("/onboarding");
						return;
					}
				})
				.catch((error) => {
					console.error("Error checking profile:", error);
					// On error, redirect to onboarding to be safe
					router.push("/onboarding");
				})
				.finally(() => {
					setIsCheckingProfile(false);
				});
		} else if (isLoaded && !user) {
			// Not authenticated, redirect to login
			router.push("/login");
		}
	}, [user, isLoaded, router]);

	// Show loading while checking profile
	if (!isLoaded || isCheckingProfile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	// Don't render if redirecting
	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<ProfileHeader />
				<ProfileStats />
				<SettingsSection />
			</main>

			<MobileNav />
		</div>
	);
}
