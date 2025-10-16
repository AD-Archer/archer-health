"use client";

import { useState } from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddEntryModal } from "@/components/add-entry-modal";
interface TodaysMeals {
	totalCalories: number;
	mealEntries: unknown[];
	date: string;
}

interface MealSummaryProps {
	todaysMeals: TodaysMeals | null;
}

export function MealSummary({ todaysMeals }: MealSummaryProps) {
	const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
	const totalCalories = todaysMeals?.totalCalories || 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-display">Today's Meals</CardTitle>
					<Button size="sm" variant="ghost" className="text-primary" onClick={() => setIsAddEntryModalOpen(true)}>
						<Plus className="w-4 h-4 mr-1" />
						Add
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-center py-8">
					<div className="text-4xl font-bold font-display text-primary mb-2">
						{totalCalories}
					</div>
					<p className="text-muted-foreground">calories consumed today</p>
				</div>
			</CardContent>
<AddEntryModal
				open={isAddEntryModalOpen}
				onOpenChange={setIsAddEntryModalOpen}
			/>
		</Card>
	);
}
