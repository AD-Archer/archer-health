"use client";

import { Activity, Award, Flame, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeeklyStats() {
	const stats = [
		{
			label: "Weight Lost",
			value: "2.5 lbs",
			icon: TrendingDown,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			label: "Workouts",
			value: "5 sessions",
			icon: Activity,
			color: "text-blue-500",
			bgColor: "bg-blue-50",
		},
		{
			label: "Avg Calories",
			value: "1,580/day",
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-50",
		},
		{
			label: "Streak",
			value: "12 days",
			icon: Award,
			color: "text-purple-500",
			bgColor: "bg-purple-50",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display">This Week</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4">
				{stats.map((stat) => (
					<div key={stat.label} className="space-y-2">
						<div className={`p-2 rounded-lg ${stat.bgColor} w-fit`}>
							<stat.icon className={`w-5 h-5 ${stat.color}`} />
						</div>
						<div>
							<p className="text-2xl font-bold font-display">{stat.value}</p>
							<p className="text-sm text-muted-foreground">{stat.label}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
