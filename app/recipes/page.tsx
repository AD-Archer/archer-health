import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { RecipeGrid } from "./components/recipe-grid";
import { RecipesHeader } from "./components/recipes-header";

export default function RecipesPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6 space-y-6">
				<RecipesHeader />
				<RecipeGrid />
			</main>

			<MobileNav />
		</div>
	);
}
