import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Achievements } from "./components/achievements";
import { ActivityGoals } from "./components/activity-goals";
import { GoalsHeader } from "./components/goals-header";
import { MacroGoals } from "./components/macro-goals";
import { WeightGoal } from "./components/weight-goal";

export default function GoalsPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<GoalsHeader />
				<WeightGoal />
				<MacroGoals />
				<ActivityGoals />
				<Achievements />
			</main>

			<MobileNav />
		</div>
	);
}
