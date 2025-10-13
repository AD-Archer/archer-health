"use client";

import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface WeightEntry {
	id: string;
	weight: number;
	date: string;
	entries?: number; // Number of weight entries averaged for this day
}

interface Goal {
	id: string;
	type: string;
	name: string;
	target: number;
	current: number;
	unit: string;
	deadline?: string;
	isActive: boolean;
}

interface WeeklyStats {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	daysLogged: number;
}

interface ProgressData {
	weightHistory: WeightEntry[];
	streaks: {
		current: number;
		longest: number;
	};
	goals: Goal[];
	weeklyStats: WeeklyStats;
}

export function WeightChart() {
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();
	const [progressData, setProgressData] = useState<ProgressData | null>(null);
	const [timeRange, setTimeRange] = useState("6weeks");

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

	// Filter data based on time range
	const getFilteredData = () => {
		if (!progressData?.weightHistory) return [];

		const now = new Date();
		let cutoffDate: Date;

		switch (timeRange) {
			case "1week":
				cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "1month":
				cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case "3months":
				cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default:
				cutoffDate = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
				break;
		}

		return progressData.weightHistory
			.filter((entry) => new Date(entry.date) >= cutoffDate)
			.map((entry) => ({
				date: new Date(entry.date).toLocaleDateString(),
				weight: getDisplayWeight(entry.weight, user?.units || "imperial"),
			}));
	};

	const data = getFilteredData();
	const unitLabel = user?.units === "imperial" ? "lbs" : "kg";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-display">Weight Trend</CardTitle>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1week">1 Week</SelectItem>
							<SelectItem value="1month">1 Month</SelectItem>
							<SelectItem value="6weeks">6 Weeks</SelectItem>
							<SelectItem value="3months">3 Months</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
							<YAxis
								stroke="#6b7280"
								fontSize={12}
								domain={["dataMin - 5", "dataMax + 5"]}
							/>
							<Tooltip
								labelFormatter={(label) => `Date: ${label}`}
								formatter={(value) => [`${value} ${unitLabel}`, "Weight"]}
							/>
							<Line
								type="monotone"
								dataKey="weight"
								stroke="#8fbc5a"
								strokeWidth={3}
								dot={{ fill: "#8fbc5a", r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No weight data available for the selected time range
					</div>
				)}
			</CardContent>
		</Card>
	);
}
