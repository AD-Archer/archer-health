"use client";

import { useState } from "react";
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
import { useNutritionData } from "@/lib/use-nutrition-data";

interface CalorieData {
	date: string;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	mealsLogged: number;
}

export function CalorieChart() {
	const [timeRange, setTimeRange] = useState("30days");
	const { progressData, loading } = useNutritionData();

	// Filter data based on time range
	const getFilteredData = () => {
		if (!progressData?.calorieHistory) return [];

		const now = new Date();
		let daysBack: number;

		switch (timeRange) {
			case "7days":
				daysBack = 7;
				break;
			case "30days":
				daysBack = 30;
				break;
			case "90days":
			default:
				daysBack = 90;
				break;
		}

		const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

		return progressData.calorieHistory
			.filter((entry) => new Date(entry.date) >= cutoffDate)
			.map((entry) => ({
				date: new Date(entry.date).toLocaleDateString(),
				calories: entry.calories,
				protein: entry.protein,
				carbs: entry.carbs,
				fat: entry.fat,
				meals: entry.mealsLogged,
			}))
			.slice(-daysBack); // Take the last N days
	};

	const data = getFilteredData();
	const averageCalories = progressData?.averages.calories || 0;

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="font-display">Calorie Intake</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[250px] text-muted-foreground">
						Loading calorie data...
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-display">Calorie Intake</CardTitle>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7days">7 Days</SelectItem>
							<SelectItem value="30days">30 Days</SelectItem>
							<SelectItem value="90days">90 Days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<>
						<ResponsiveContainer width="100%" height={250}>
							<LineChart data={data}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
								<YAxis
									stroke="#6b7280"
									fontSize={12}
									domain={["dataMin - 200", "dataMax + 200"]}
								/>
								<Tooltip
									labelFormatter={(label) => `Date: ${label}`}
									formatter={(value, name) => {
										if (name === "calories")
											return [`${value} cal`, "Calories"];
										if (name === "meals")
											return [`${value} meals`, "Meals Logged"];
										return [value, name];
									}}
								/>
								<Line
									type="monotone"
									dataKey="calories"
									stroke="#f97316"
									strokeWidth={3}
									dot={{ fill: "#f97316", r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
						<div className="mt-4 text-center text-sm text-muted-foreground">
							Average: {Math.round(averageCalories)} calories/day
						</div>
					</>
				) : (
					<div className="flex items-center justify-center h-[250px] text-muted-foreground">
						No calorie data available for the selected time range
					</div>
				)}
			</CardContent>
		</Card>
	);
}
