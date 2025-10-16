import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Recipes } from "./components/recipes";

export default function RecipesPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<Recipes />
			</main>

			<MobileNav />
		</div>
	);
}
