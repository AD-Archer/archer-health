"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Goal, MealEntry, User } from "@/app/data/data";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { useStore } from "@/lib/store";
import { DashboardHeader } from "./components/dashboard-header";
import { MacrosCard } from "./components/macros-card";
import { MealSummary } from "./components/meal-summary";
import { MotivationalNotes } from "./components/motivational-notes";
import { NutrientsCard } from "./components/nutrients-card";
import { ProgressChart } from "./components/progress-chart";
import { QuickStats } from "./components/quick-stats";
import { TargetProgressCard } from "./components/target-progress-card";
import { WeightUpdateCard } from "./components/weight-update-card";

interface UserProfile {
	id: string;
	clerkId?: string;
	currentWeight: number | null;
	goalWeight: number | null;
	height: number | null;
	age: number | null;
	name: string | null;
	email: string;
	dailyCalorieGoal: number | null;
	macroGoals: {
		protein: number;
		carbs: number;
		fat: number;
	};
	waterGoal: number | null;
	weeklyGoal: number | null;
	goalType: string | null;
	units: string;
}

interface TodaysMeals {
	totalCalories: number;
	mealEntries: MealEntry[];
	date: string;
}

interface TodaysMacros {
	macros: {
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
	};
	nutrients: {
		vitaminC: number;
		calcium: number;
		iron: number;
		fiber: number;
	};
	date: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const { updateUser } = useStore();
	const [isCheckingProfile, setIsCheckingProfile] = useState(true);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [todaysMeals, setTodaysMeals] = useState<TodaysMeals | null>(null);
	const [todaysMacros, setTodaysMacros] = useState<TodaysMacros | null>(null);
	const [_goals, setGoals] = useState<Goal[]>([]);

	useEffect(() => {
		if (isLoaded && user) {
			// Fetch user profile
			fetch("/api/user-profile")
				.then((res) => res.json())
				.then((data) => {
					if (data.user) {
						const profile = data.user as UserProfile;
						setUserProfile(profile);
						updateUser(profile as Partial<User>); // Update store with latest data
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
					console.error("Error fetching user profile:", error);
					// On error, redirect to onboarding to be safe
					router.push("/onboarding");
				})
				.finally(() => {
					setIsCheckingProfile(false);
				});

			// Fetch today's meals
			fetch("/api/todays-meals")
				.then((res) => res.json())
				.then((data) => {
					setTodaysMeals(data);
				})
				.catch((error) => {
					console.error("Error fetching today's meals:", error);
				});

			// Fetch today's macros and nutrients
			fetch("/api/todays-macros")
				.then((res) => res.json())
				.then((data) => {
					setTodaysMacros(data);
				})
				.catch((error) => {
					console.error("Error fetching today's macros:", error);
				});

			// Fetch goals
			fetch("/api/goals")
				.then((res) => res.json())
				.then((data) => {
					setGoals(data.goals || []);
				})
				.catch((error) => {
					console.error("Error fetching goals:", error);
				});
		} else if (isLoaded && !user) {
			// Not authenticated, redirect to login
			router.push("/login");
		}
	}, [isLoaded, user, updateUser, router]);

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
				<DashboardHeader />
				<QuickStats userProfile={userProfile} todaysMeals={todaysMeals} />
				<MotivationalNotes userProfile={userProfile} />
				<div className="grid gap-6 md:grid-cols-2">
					<ProgressChart />
					<WeightUpdateCard
						userProfile={userProfile}
						onWeightUpdate={(newWeight: number) => {
							setUserProfile((prev) =>
								prev ? { ...prev, currentWeight: newWeight } : null,
							);
							updateUser({ currentWeight: newWeight } as Partial<User>);
						}}
					/>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					<MacrosCard userProfile={userProfile} todaysMacros={todaysMacros} />
					<NutrientsCard
						_userProfile={userProfile}
						todaysMacros={todaysMacros}
					/>
					<TargetProgressCard userProfile={userProfile} />
				</div>
				<MealSummary todaysMeals={todaysMeals} />
			</main>

			<MobileNav />
		</div>
	);
}
