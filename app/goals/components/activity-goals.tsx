"use client";

import { CheckCircle, Lock, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define Achievement type locally since '@/app/data/data' is missing
export type Achievement = {
	achievementId: string;
	name: string;
	description: string;
	requirement: string;
	icon: React.ReactNode;
	isUnlocked: boolean;
	unlockedAt?: Date;
	triggerType?: "manual" | "auto";
};

export function Achievements() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchAchievements = useCallback(async () => {
		try {
			const response = await fetch("/api/achievements");
			if (response.ok) {
				const data = await response.json();
				setAchievements(data.achievements);
			} else {
				console.error("Failed to fetch achievements");
			}
		} catch (error) {
			console.error("Error fetching achievements:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAchievements();
	}, [fetchAchievements]);

	const handleUnlockAchievement = async (achievementId: string) => {
		try {
			const response = await fetch("/api/achievements", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ achievementId }),
			});

			if (response.ok) {
				const data = await response.json();
				// Update the local state
				setAchievements((prev) =>
					prev.map((ach) =>
						ach.achievementId === achievementId
							? {
									...ach,
									isUnlocked: true,
									unlockedAt: new Date(data.achievement.unlockedAt),
								}
							: ach,
					),
				);
			} else {
				console.error("Failed to unlock achievement");
			}
		} catch (error) {
			console.error("Error unlocking achievement:", error);
		}
	};

	const unlockedAchievements = achievements.filter((ach) => ach.isUnlocked);
	const lockedAchievements = achievements.filter((ach) => !ach.isUnlocked);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-display flex items-center gap-2">
					<Trophy className="w-5 h-5" />
					Achievements
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
					<p className="text-sm text-blue-800 dark:text-blue-200">
						🏆 Complete challenges and unlock achievements! For full fitness
						tracking and workout plans, visit{" "}
						<a
							href="https://fitness.adarcher.app"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:no-underline font-medium"
						>
							Archer Fitness
						</a>
					</p>
				</div>

				{loading ? (
					<p className="text-muted-foreground text-center py-4">
						Loading achievements...
					</p>
				) : (
					<>
						{/* Unlocked Achievements */}
						{unlockedAchievements.length > 0 && (
							<div className="space-y-2">
								<h3 className="text-sm font-medium text-green-700 dark:text-green-300">
									Unlocked ({unlockedAchievements.length})
								</h3>
								{unlockedAchievements.map((achievement) => (
									<div
										key={achievement.achievementId}
										className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
									>
										<div className="text-2xl">{achievement.icon}</div>
										<div className="flex-1">
											<p className="font-medium flex items-center gap-2">
												{achievement.name}
												<CheckCircle className="w-4 h-4 text-green-600" />
											</p>
											<p className="text-sm text-muted-foreground">
												{achievement.description}
											</p>
											{achievement.unlockedAt && (
												<p className="text-xs text-green-600">
													Unlocked {achievement.unlockedAt.toLocaleDateString()}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Locked Achievements */}
						{lockedAchievements.length > 0 && (
							<div className="space-y-2">
								<h3 className="text-sm font-medium text-muted-foreground">
									Available ({lockedAchievements.length})
								</h3>
								{lockedAchievements.map((achievement) => (
									<div
										key={achievement.achievementId}
										className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-muted"
									>
										<div className="text-2xl opacity-50">
											{achievement.icon}
										</div>
										<div className="flex-1">
											<p className="font-medium flex items-center gap-2">
												{achievement.name}
												<Lock className="w-4 h-4 text-muted-foreground" />
											</p>
											<p className="text-sm text-muted-foreground">
												{achievement.description}
											</p>
											<p className="text-xs text-muted-foreground">
												{achievement.requirement}
											</p>
										</div>
										{achievement.triggerType === "manual" && (
											<Button
												size="sm"
												onClick={() =>
													handleUnlockAchievement(achievement.achievementId)
												}
												className="bg-primary hover:bg-primary/90"
											>
												Claim
											</Button>
										)}
									</div>
								))}
							</div>
						)}

						{achievements.length === 0 && (
							<p className="text-muted-foreground text-center py-4">
								No achievements available yet.
							</p>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
