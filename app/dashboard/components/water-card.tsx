"use client";

import { Droplets } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HydrationLog {
	id: string;
	amount: number;
	date: string;
	notes?: string;
	drink?: {
		name: string;
	};
}

export function WaterCard() {
	const [logs, setLogs] = useState<HydrationLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [waterGoal, setWaterGoal] = useState(64); // Default 64 oz

	useEffect(() => {
		const fetchHydrationData = async () => {
			try {
				// Fetch hydration logs from Archer Health's own API
				const logsResponse = await fetch("/api/hydration-logs");

				if (logsResponse.ok) {
					const logsData = await logsResponse.json();
					setLogs(logsData);
				} else if (logsResponse.status === 401) {
					setError("Please log in to view hydration data");
				} else {
					setError("Unable to fetch hydration data");
				}
			} catch (err) {
				console.error("Error fetching hydration data:", err);
				setError("Failed to load hydration data");
			} finally {
				setLoading(false);
			}
		};

		fetchHydrationData();
	}, []);

	// Fetch user's water goal (from Archer Aqua if connected, otherwise local)
	useEffect(() => {
		const fetchUserProfileAndGoal = async () => {
			try {
				const response = await fetch("/api/user-profile");
				const data = await response.json();

				// Check if connected to Archer Aqua
				const isConnected = !!data.user?.archerAquaConnectionCode;

				if (isConnected && data.user?.archerAquaConnectionCode) {
					// Fetch goal from Archer Aqua's backend
					const aquaUrl =
						process.env.NEXT_PUBLIC_ARCHER_AQUA_URL || "http://localhost:8080";
					const goalResponse = await fetch(`${aquaUrl}/api/hydration-goals`, {
						headers: {
							Authorization: `Bearer ${data.user.archerAquaConnectionCode}`,
						},
					});

					if (goalResponse.ok) {
						const goalData = await goalResponse.json();
						if (goalData.waterGoal) {
							// Archer Aqua returns goal in ml, convert to oz for display
							const goalInOz = goalData.waterGoal / 29.5735;
							setWaterGoal(goalInOz);
						}
					} else {
						// Fall back to local goal
						if (data.user?.waterGoal) {
							setWaterGoal(data.user.waterGoal);
						}
					}
				} else {
					// Use local goal
					if (data.user?.waterGoal) {
						setWaterGoal(data.user.waterGoal);
					}
				}
			} catch (err) {
				console.error("Error fetching user profile:", err);
			}
		};
		fetchUserProfileAndGoal();
	}, []);

	// Calculate today's total
	const today = new Date().toISOString().split("T")[0];
	const todayLogs = logs.filter((log) => log.date.startsWith(today));
	const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await fetch("/api/user-profile");
				const data = await response.json();
				if (data.user?.waterGoal && !data.user?.archerAquaConnectionCode) {
					// Only use local goal if not connected to Archer Aqua
					setWaterGoal(data.user.waterGoal);
				}
			} catch (err) {
				console.error("Error fetching user profile:", err);
			}
		};
		fetchUserProfile();
	}, []);

	const progressPercentage = Math.min((todayTotal / waterGoal) * 100, 100);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Droplets className="w-5 h-5" />
						Water Intake
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-2">
						<div className="h-4 bg-muted rounded"></div>
						<div className="h-2 bg-muted rounded"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Droplets className="w-5 h-5" />
						Water Intake
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">{error}</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Droplets className="w-5 h-5" />
					Water Intake
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Today's Progress</span>
						<span>
							{todayTotal.toFixed(1)} / {waterGoal.toFixed(1)} oz
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2" />
				</div>

				{todayLogs.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium">Recent Drinks</h4>
						<div className="space-y-1">
							{todayLogs.slice(0, 3).map((log) => (
								<div
									key={log.id}
									className="flex justify-between text-xs text-muted-foreground"
								>
									<span>{log.notes || "Drink"}</span>
									<span>{log.amount.toFixed(1)} oz</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
