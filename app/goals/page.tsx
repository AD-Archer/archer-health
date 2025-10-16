"use client";

// Use Node.js runtime to ensure Node APIs (like fs) are available
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { useStore } from "@/lib/store";
import { AchievementSystem } from "./components/achievement-system";
import { Achievements } from "./components/achievements";
import { GoalsHeader } from "./components/goals-header";

import { MacroGoals } from "./components/macro-goals";
import { WeightGoal } from "./components/weight-goal";

export default function GoalsPage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const { updateUser, setGoals } = useStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isLoaded && user) {
			// Fetch user profile
			fetch("/api/user-profile")
				.then((res) => res.json())
				.then((data) => {
					if (data.user) {
						updateUser(data.user);
					} else {
						// No profile data exists, redirect to onboarding
						router.push("/onboarding");
						return;
					}
				})
				.catch((error) => {
					console.error("Error fetching user profile:", error);
				});

			// Fetch goals
			fetch("/api/goals")
				.then((res) => res.json())
				.then((data) => {
					if (data.goals) {
						setGoals(data.goals);
					}
					setIsLoading(false);
				})
				.catch((error) => {
					console.error("Error fetching goals:", error);
					setIsLoading(false);
				});
		} else if (isLoaded && !user) {
			router.push("/login");
		}
	}, [isLoaded, user, updateUser, setGoals, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-muted/30 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading your goals...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-8">
				<GoalsHeader />

				{/* Main Weight Goal - Most Prominent */}
				<WeightGoal />

				{/* Other Goals */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<MacroGoals />
					<AchievementSystem />
				</div>

				<Achievements />
			</main>

			<MobileNav />
		</div>
	);
}
