import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { DailyProgress } from "./components/daily-progress";
import { MealLogHeader } from "./components/meal-log-header";
import { MealTypeSection } from "./components/meal-type-section";

export default function MealLogPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<MealLogHeader />
				<DailyProgress />
				<div className="space-y-4">
					<MealTypeSection mealType="breakfast" />
					<MealTypeSection mealType="lunch" />
					<MealTypeSection mealType="dinner" />
					<MealTypeSection mealType="snacks" />
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
