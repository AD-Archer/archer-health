"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { mockProgressData } from "@/app/data/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
	id: string;
	clerkId?: string;
	currentWeight: number | null;
	goalWeight: number | null;
	height: number | null;
	age: number | null;
	name: string | null;
	email: string;
	dailyCalorieGoal: number | null;
	macroGoals: any;
	waterGoal: number | null;
	weeklyGoal: number | null;
	goalType: string | null;
	units: string;
}

interface ProgressChartProps {
	userProfile: UserProfile | null;
}

export function ProgressChart({ userProfile }: ProgressChartProps) {
	// Transform mock data to show weight progress
	const weightData = mockProgressData.map((item) => ({
		...item,
		value: userProfile?.currentWeight
			? userProfile.currentWeight - Math.random() * 5 + Math.random() * 10
			: item.value,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display">Weight Progress</CardTitle>
			</CardHeader>
			<CardContent>
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
			</CardContent>
		</Card>
	);
}
