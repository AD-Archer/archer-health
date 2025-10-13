"use client";

import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface ProgressData {
	weightHistory: Array<{
		id: string;
		weight: number;
		date: string;
		entries?: number; // Number of weight entries averaged for this day
	}>;
}

export function ProgressChart() {
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();
	const [progressData, setProgressData] = useState<ProgressData | null>(null);

	useEffect(() => {
		const fetchProgress = async () => {
			try {
				const response = await fetch("/api/progress");
				if (response.ok) {
					const data = await response.json();
					setProgressData(data);
				}
			} catch (error) {
				console.error("Error fetching progress data:", error);
			}
		};

		fetchProgress();
	}, []);

	// Transform weight history data for the chart
	const weightData = progressData?.weightHistory
		? progressData.weightHistory.slice(-14).map((entry, index) => ({
				date: `Day ${index + 1}`,
				value: getDisplayWeight(entry.weight, user?.units || "imperial") || 0,
			}))
		: [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display">Weight Progress</CardTitle>
			</CardHeader>
			<CardContent>
				{weightData.length > 0 ? (
					<ResponsiveContainer width="100%" height={250}>
						<AreaChart data={weightData}>
							<defs>
								<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#8fbc5a" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#8fbc5a" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
							<YAxis stroke="#6b7280" fontSize={12} />
							<Area
								type="monotone"
								dataKey="value"
								stroke="#8fbc5a"
								strokeWidth={2}
								fill="url(#colorValue)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[250px] text-muted-foreground">
						No weight data available yet. Start logging your weight to see
						progress!
					</div>
				)}
			</CardContent>
		</Card>
	);
}
