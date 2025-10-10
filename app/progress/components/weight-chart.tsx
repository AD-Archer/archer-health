"use client";

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

export function WeightChart() {
	const user = useStore((state) => state.user);
	const { getDisplayWeight } = useUnitConversion();

	// Convert hardcoded data to display units (assuming data is in kg)
	const data = [
		{ date: "Week 1", weight: getDisplayWeight(74.8, user.units) }, // ~165 lbs
		{ date: "Week 2", weight: getDisplayWeight(73.9, user.units) }, // ~163 lbs
		{ date: "Week 3", weight: getDisplayWeight(73.5, user.units) }, // ~162 lbs
		{ date: "Week 4", weight: getDisplayWeight(72.6, user.units) }, // ~160 lbs
		{ date: "Week 5", weight: getDisplayWeight(72.1, user.units) }, // ~159 lbs
		{ date: "Week 6", weight: getDisplayWeight(71.7, user.units) }, // ~158 lbs
	];

	const unitLabel = user.units === "imperial" ? "lbs" : "kg";
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-display">Weight Trend</CardTitle>
					<Select defaultValue="6weeks">
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
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
						<XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
						<YAxis
							stroke="#6b7280"
							fontSize={12}
							domain={["dataMin - 5", "dataMax + 5"]}
						/>
						<Tooltip />
						<Line
							type="monotone"
							dataKey="weight"
							stroke="#8fbc5a"
							strokeWidth={3}
							dot={{ fill: "#8fbc5a", r: 4 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
