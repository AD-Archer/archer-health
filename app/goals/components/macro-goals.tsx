"use client";

import { Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export function MacroGoals() {
	const goals = useStore((state) => state.goals);
	const user = useStore((state) => state.user);

	// Handle loading state when user data is not available
	if (!user) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading macro goals...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const macroGoals = goals.filter(
		(goal) => goal.type === "macro" && goal.isActive,
	);

	// Get macro goals from user profile
	const userMacroGoals = user.macroGoals as {
		protein?: number;
		carbs?: number;
		fat?: number;
	} | null;

	const getMacroIcon = (name: string) => {
		if (name.toLowerCase().includes("protein")) return Activity;
		return Target;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-display">Macro Goals</CardTitle>
			</CardHeader>
			<CardContent>
				{userMacroGoals?.protein ? (
					<div className="space-y-3">
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
								<Activity className="w-5 h-5 text-blue-600" />
							</div>
							<div className="flex-1">
								<p className="font-medium">Protein</p>
								<p className="text-sm text-muted-foreground">
									{userMacroGoals.protein} g/day
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
								<Target className="w-5 h-5 text-green-600" />
							</div>
							<div className="flex-1">
								<p className="font-medium">Carbohydrates</p>
								<p className="text-sm text-muted-foreground">
									{userMacroGoals.carbs} g/day
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
								<Target className="w-5 h-5 text-orange-600" />
							</div>
							<div className="flex-1">
								<p className="font-medium">Fat</p>
								<p className="text-sm text-muted-foreground">
									{userMacroGoals.fat} g/day
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
						<div className="p-2 rounded-lg bg-primary/10">
							<Activity className="w-5 h-5 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-medium">Protein</p>
							<p className="text-sm text-muted-foreground">
								Complete your profile to see macro goals
							</p>
						</div>
					</div>
				)}

				{/* Show any custom macro goals from the goals array */}
				{macroGoals.length > 0 && (
					<div className="mt-4 pt-4 border-t">
						<p className="text-sm font-medium text-muted-foreground mb-2">
							Custom Macro Goals
						</p>
						{macroGoals.map((goal) => {
							const Icon = getMacroIcon(goal.name);
							return (
								<div
									key={goal.id}
									className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 mb-2"
								>
									<div className="p-2 rounded-lg bg-primary/10">
										<Icon className="w-5 h-5 text-primary" />
									</div>
									<div className="flex-1">
										<p className="font-medium">{goal.name}</p>
										<p className="text-sm text-muted-foreground">
											{goal.current}/{goal.target} {goal.unit}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
