import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

interface MealDBRecipe {
	id: string;
	title: string;
	category: string;
	area: string;
	instructions: string;
	thumbnail: string;
	youtube?: string;
	ingredients: Array<{
		ingredient: string;
		measure: string;
	}>;
	tags?: string[];
	source?: string | null;
	estimated_time?: number;
	estimated_calories?: number;
	difficulty?: string;
	servings?: number;
}

interface MealDBData {
	recipes: MealDBRecipe[];
}

// Parse ingredient measure (e.g., "175g/6oz" -> { amount: 175, unit: "g" })
function parseIngredientMeasure(measure: string): {
	amount: number;
	unit: string;
} {
	// Handle empty measures
	if (!measure || measure.trim() === "") {
		return { amount: 1, unit: "piece" };
	}

	const trimmed = measure.trim();

	// Handle simple numbers (e.g., "2")
	const numberMatch = trimmed.match(/^(\d+)$/);
	if (numberMatch) {
		return { amount: parseInt(numberMatch[1], 10), unit: "piece" };
	}

	// Handle fractions (e.g., "1/2")
	const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
	if (fractionMatch) {
		const numerator = parseInt(fractionMatch[1], 10);
		const denominator = parseInt(fractionMatch[2], 10);
		return { amount: numerator / denominator, unit: "piece" };
	}

	// Handle measurements with units (e.g., "175g/6oz", "2 tbsp", "1 tsp")
	const measureMatch = trimmed.match(/^([\d/.\s]+)\s*([a-zA-Z]+.*)$/);
	if (measureMatch) {
		const amountStr = measureMatch[1].trim();
		const unit = measureMatch[2].trim();

		// Parse amount (handle fractions like "1 1/2")
		let amount = 0;
		const parts = amountStr.split(/\s+/);
		for (const part of parts) {
			if (part.includes("/")) {
				const [num, den] = part.split("/").map((n) => parseInt(n, 10));
				amount += num / den;
			} else {
				amount += parseFloat(part);
			}
		}

		return { amount, unit };
	}

	// Fallback
	return { amount: 1, unit: trimmed || "piece" };
}

// Transform MealDB recipe to our Recipe format
function transformMealDBRecipe(mealDBRecipe: MealDBRecipe) {
	// Transform ingredients
	const ingredients = mealDBRecipe.ingredients
		.filter((ing) => ing.ingredient && ing.ingredient.trim() !== "")
		.map((ing, i) => ({
			id: `${mealDBRecipe.id}-${i}`,
			name: ing.ingredient.trim(),
			amount: parseIngredientMeasure(ing.measure).amount,
			unit: parseIngredientMeasure(ing.measure).unit,
		}));

	// Split instructions into steps (by double line breaks or numbered steps)
	const instructions = mealDBRecipe.instructions
		.split(/\r\n\r\n|\n\n|\r\r/)
		.map((step) => step.trim())
		.filter((step) => step.length > 0);

	// Use actual MealDB metadata instead of estimates
	const calories = mealDBRecipe.estimated_calories || 0;
	const nutrition = {
		protein: Math.floor(Math.random() * 25) + 15, // Still estimate protein/carbs/fat as MealDB doesn't provide these
		carbs: Math.floor(Math.random() * 40) + 30,
		fat: Math.floor(Math.random() * 20) + 8,
		fiber: Math.floor(Math.random() * 6) + 3,
		sugar: Math.floor(Math.random() * 15) + 5,
		note: mealDBRecipe.estimated_calories
			? "Nutrition data from MealDB - protein/carbs/fat are estimates"
			: "Nutrition data not available from source",
	};

	// Use actual MealDB difficulty, map to our format
	let difficulty: "Easy" | "Medium" | "Hard" = "Medium";
	if (mealDBRecipe.difficulty) {
		const dbDifficulty = mealDBRecipe.difficulty.toLowerCase();
		if (dbDifficulty === "easy") difficulty = "Easy";
		else if (dbDifficulty === "hard") difficulty = "Hard";
		// "medium" maps to "Medium" (default)
	}

	// Use actual MealDB time estimate
	const prepTime = mealDBRecipe.estimated_time || 30;

	// Use actual MealDB servings
	const servings = mealDBRecipe.servings || 4;

	// Create tags array with MealDB tags plus area, category, and difficulty
	const tags = [
		...(mealDBRecipe.tags || []),
		mealDBRecipe.area,
		mealDBRecipe.category,
		difficulty,
	].filter(Boolean); // Remove any null/undefined values

	return {
		name: mealDBRecipe.title,
		description: `${mealDBRecipe.title} - A delicious ${mealDBRecipe.category.toLowerCase()} recipe from ${mealDBRecipe.area} cuisine.`,
		image: mealDBRecipe.thumbnail,
		category: mealDBRecipe.category,
		cuisine: mealDBRecipe.area,
		prepTime,
		cookTime: 0, // MealDB doesn't provide cook time separately
		servings,
		difficulty,
		calories,
		nutrition,
		ingredients,
		instructions,
		tags,
		youtube: mealDBRecipe.youtube || null,
		source: mealDBRecipe.source || null,
	};
}

async function seedMealsFromMealDB() {
	console.log("Seeding recipes from MealDB...");

	try {
		// Read the MealDB JSON file
		const mealDBPath = path.join(process.cwd(), "data", "mealdb.json");
		const mealDBContent = fs.readFileSync(mealDBPath, "utf-8");
		const mealDBData: MealDBData = JSON.parse(mealDBContent);

		console.log(`Found ${mealDBData.recipes.length} recipes in MealDB data`);

		// Get the first user or create a system user for recipes
		let systemUser = await prisma.user.findFirst();
		if (!systemUser) {
			systemUser = await prisma.user.create({
				data: {
					clerkId: "system-recipes",
					email: "system@archerhealth.com",
					name: "Archer Health",
					isPremium: true,
				},
			});
		}

		let seededCount = 0;
		let skippedCount = 0;

		// Process recipes in batches to avoid overwhelming the database
		const batchSize = 10;
		for (let i = 0; i < mealDBData.recipes.length; i += batchSize) {
			const batch = mealDBData.recipes.slice(i, i + batchSize);

			for (const mealDBRecipe of batch) {
				try {
					const recipe = transformMealDBRecipe(mealDBRecipe);

					// Debug first recipe
					if (i === 0 && batch.indexOf(mealDBRecipe) === 0) {
						console.log(`Sample recipe "${mealDBRecipe.title}":`);
						console.log(
							`- Original ingredients:`,
							mealDBRecipe.ingredients.slice(0, 3),
						);
						console.log(
							`- Parsed ingredients:`,
							recipe.ingredients.slice(0, 3),
						);
						console.log(`- Total ingredients: ${recipe.ingredients.length}`);
					}

					// Skip recipes that don't have valid ingredients
					if (recipe.ingredients.length === 0) {
						console.log(
							`Skipping recipe "${mealDBRecipe.title}" - no valid ingredients after parsing`,
						);
						skippedCount++;
						continue;
					}

					// Check if recipe already exists (skip for now since we want to reseed)
					// const existingRecipe = await prisma.recipe.findFirst({
					//   where: {
					//     name: recipe.name,
					//     createdBy: systemUser.name || "MealDB",
					//   },
					// });

					// if (existingRecipe) {
					//   skippedCount++;
					//   continue;
					// }

					await prisma.recipe.create({
						data: {
							...recipe,
							userId: systemUser.id,
							createdBy: systemUser.name || "MealDB",
						},
					});

					seededCount++;
				} catch (error) {
					console.error(`Error seeding recipe "${mealDBRecipe.title}":`, error);
					skippedCount++;
				}
			}

			console.log(
				`Processed ${Math.min(i + batchSize, mealDBData.recipes.length)}/${mealDBData.recipes.length} recipes...`,
			);
		}

		console.log(`Successfully seeded ${seededCount} recipes from MealDB`);
		if (skippedCount > 0) {
			console.log(
				`Skipped ${skippedCount} recipes due to errors or missing data`,
			);
		}
	} catch (error) {
		console.error("Error reading or parsing MealDB data:", error);
		throw error;
	}
}

async function main() {
	try {
		console.log("Starting MealDB recipe seeding...");

		await seedMealsFromMealDB();

		console.log("MealDB seeding completed successfully!");
	} catch (error) {
		console.error("MealDB seeding failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
export { seedMealsFromMealDB };
