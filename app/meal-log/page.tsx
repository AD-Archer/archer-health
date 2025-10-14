"use client";

import { useEffect, useState } from "react";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { useStore } from "@/lib/store";
import { DailyProgress } from "./components/daily-progress";
import { MealLogHeader } from "./components/meal-log-header";
import { MealTypeSection } from "./components/meal-type-section";

export default function MealLogPage() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const setMealEntries = useStore((state) => state.setMealEntries);
	const setFoods = useStore((state) => state.setFoods);
	const updateUser = useStore((state) => state.updateUser);

	useEffect(() => {
		const loadData = async () => {
			try {
				console.log("Loading meal log data for date:", selectedDate);

				// Load user profile data
				const userResponse = await fetch("/api/user-profile");
				if (userResponse.ok) {
					const userData = await userResponse.json();
					console.log("Loaded user profile:", userData.user);
					updateUser(userData.user);
				} else {
					console.error("Failed to load user profile:", userResponse.status);
				}

				// Load meal entries for selected date
				const dateString = selectedDate.toISOString().split("T")[0];
				const mealsResponse = await fetch(
					`/api/todays-meals?date=${dateString}`,
				);
				if (mealsResponse.ok) {
					const mealsData = await mealsResponse.json();
					console.log("Loaded meal entries:", mealsData.mealEntries);
					setMealEntries(mealsData.mealEntries);
				} else {
					console.error("Failed to load meals:", mealsResponse.status);
				}

				// Load user's foods (these don't change by date)
				const foodsResponse = await fetch("/api/foods");
				if (foodsResponse.ok) {
					const foodsData = await foodsResponse.json();
					console.log("Loaded foods:", foodsData);
					setFoods(foodsData);
				} else {
					console.error("Failed to load foods:", foodsResponse.status);
				}
			} catch (error) {
				console.error("Error loading data:", error);
			}
		};

		loadData();
	}, [selectedDate, setMealEntries, setFoods, updateUser]);
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<MealLogHeader
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
				/>
				<DailyProgress selectedDate={selectedDate} />
				<div className="space-y-4">
					<MealTypeSection mealType="breakfast" selectedDate={selectedDate} />
					<MealTypeSection mealType="lunch" selectedDate={selectedDate} />
					<MealTypeSection mealType="dinner" selectedDate={selectedDate} />
					<MealTypeSection mealType="snacks" selectedDate={selectedDate} />
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
