"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MealLogHeader() {
	const [date, setDate] = useState(new Date());

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const changeDate = (days: number) => {
		const newDate = new Date(date);
		newDate.setDate(newDate.getDate() + days);
		setDate(newDate);
	};

	const goToToday = () => {
		setDate(new Date());
	};

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<h1 className="text-3xl font-bold font-display">Meal Log</h1>
				<p className="text-muted-foreground">Track your daily nutrition</p>
			</div>

			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					onClick={goToToday}
					className="min-w-[200px] bg-transparent"
				>
					<Calendar className="w-4 h-4 mr-2" />
					{formatDate(date)}
				</Button>
				<Button variant="outline" size="icon" onClick={() => changeDate(1)}>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
