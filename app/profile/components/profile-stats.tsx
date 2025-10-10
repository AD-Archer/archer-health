"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface UserProfile {
	id: string;
	clerkId: string;
	name: string;
	email: string;
	username: string | null;
	avatar: string | null;
	currentWeight: number | null;
	goalWeight: number | null;
	height: number | null;
	age: number | null;
	units: string;
	// Add other fields as needed
}

export function ProfileStats() {
	const { user, isLoaded } = useUser();
	const { formatWeight, formatHeight } = useUnitConversion();
	const [profileData, setProfileData] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isLoaded && user) {
			fetch("/api/user-profile")
				.then((res) => {
					if (!res.ok) {
						throw new Error(`HTTP error! status: ${res.status}`);
					}
					return res.json();
				})
				.then((data) => {
					if (data.user) {
						setProfileData(data.user);
					} else if (data.error) {
						console.error("API Error:", data.error);
					}
				})
				.catch((error) => {
					console.error("Error fetching profile data:", error);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [user, isLoaded]);

	if (!isLoaded || isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="font-display">Your Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="text-center p-4 rounded-lg bg-muted/50">
								<div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
								<div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!profileData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="font-display">Your Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground">
						No profile data available. Complete your onboarding to see your
						stats.
					</p>
				</CardContent>
			</Card>
		);
	}

	// Convert values based on units preference
	const isImperial = profileData.units === "imperial";

	const stats = [
		{
			label: "Current Weight",
			value: profileData.currentWeight
				? formatWeight(profileData.currentWeight, profileData.units)
				: "Not set",
		},
		{
			label: "Goal Weight",
			value: profileData.goalWeight
				? formatWeight(profileData.goalWeight, profileData.units)
				: "Not set",
		},
		{
			label: "Height",
			value: profileData.height
				? formatHeight(profileData.height, profileData.units)
				: "Not set",
		},
		{
			label: "Age",
			value: profileData.age ? `${profileData.age} years` : "Not set",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display">Your Stats</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="text-center p-3 sm:p-4 rounded-lg bg-muted/50"
						>
							<p className="text-xl sm:text-2xl font-bold font-display">
								{stat.value}
							</p>
							<p className="text-xs sm:text-sm text-muted-foreground">
								{stat.label}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
