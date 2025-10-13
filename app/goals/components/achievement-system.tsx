"use client";

import { CheckCircle, Lock, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Achievement } from "@/app/data/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AchievementSystem() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAll, setShowAll] = useState(false);

	const fetchAchievements = useCallback(async () => {
		try {
			const response = await fetch("/api/achievements");
			if (response.ok) {
				const data = await response.json();
				// Parse unlockedAt strings to Date objects
				const achievements: Achievement[] = data.achievements.map(
					(ach: Achievement & { unlockedAt: string | null }) => ({
						...ach,
						unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : undefined,
					}),
				);
				setAchievements(achievements);
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
				const errorData = await response
					.json()
					.catch(() => ({ error: "Unknown error" }));
				console.error("Failed to unlock achievement:", errorData.error);
				alert(`Failed to unlock achievement: ${errorData.error}`);
			}
		} catch (error) {
			console.error("Error unlocking achievement:", error);
		}
	};

	const unlockedAchievements = achievements.filter((ach) => ach.isUnlocked);
	const lockedAchievements = achievements.filter(
		(ach) => !ach.isUnlocked && ach.triggerType === "manual",
	);

	// Show only first 3 achievements unless "view more" is clicked
	const displayedAchievements = showAll
		? lockedAchievements
		: lockedAchievements.slice(0, 3);
	const hasMoreAchievements = lockedAchievements.length > 3;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-display flex items-center gap-2">
					<Trophy className="w-5 h-5" />
					Achievements
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
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
								{unlockedAchievements.map((achievement, index) => (
									<div
										key={achievement.achievementId || `unlocked-${index}`}
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
								{displayedAchievements.map((achievement, index) => (
									<div
										key={achievement.achievementId || `achievement-${index}`}
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
								{hasMoreAchievements && !showAll && (
									<Button
										variant="outline"
										className="w-full mt-2"
										onClick={() => setShowAll(true)}
									>
										View More Achievements
									</Button>
								)}
								{showAll && hasMoreAchievements && (
									<Button
										variant="outline"
										className="w-full mt-2"
										onClick={() => setShowAll(false)}
									>
										Show Less
									</Button>
								)}
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
