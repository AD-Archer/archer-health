import { notFound } from "next/navigation";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { prisma } from "@/lib/prisma";
import { RecipeDetail } from "../components/recipe-detail";

interface RecipePageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function RecipePage({ params }: RecipePageProps) {
	const { id } = await params;
	const recipe = await prisma.recipe.findUnique({
		where: { id },
	});

	console.log("Recipe data:", {
		id: recipe?.id,
		name: recipe?.name,
		youtube: recipe?.youtube,
		source: recipe?.source,
		tags: recipe?.tags,
	});

	if (!recipe) {
		notFound();
	}

	// Transform the database recipe to match our Recipe type
	const transformedRecipe = {
		...recipe,
		cuisine: recipe.cuisine || undefined,
		difficulty: recipe.difficulty as "Easy" | "Medium" | "Hard",
		nutrition: recipe.nutrition as {
			protein: number;
			carbs: number;
			fat: number;
			fiber?: number;
			sugar?: number;
		},
		ingredients: recipe.ingredients as Array<{
			id: string;
			name: string;
			amount: number;
			unit: string;
			notes?: string;
		}>,
		instructions: recipe.instructions as string[],
		tags: recipe.tags as string[],
		youtube: recipe.youtube || undefined,
		source: recipe.source || undefined,
	};

	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6">
				<RecipeDetail recipe={transformedRecipe} />
			</main>

			<MobileNav />
		</div>
	);
}
