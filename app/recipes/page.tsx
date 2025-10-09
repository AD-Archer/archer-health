import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { RecipesHeader } from "./components/recipes-header"
import { RecipeGrid } from "./components/recipe-grid"

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
  )
}
