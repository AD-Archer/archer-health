import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import { type Prisma, PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const DATA_DIR = path.join(
	process.cwd(),
	"data",
	"FoodData_Central_csv_2025-04-24",
);

async function seedFoodCategories() {
	console.log("Seeding food categories...");
	const categories: Prisma.UsdaFoodCategoryCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "food_category.csv"))
			.pipe(csv())
			.on("data", (row) => {
				categories.push({
					id: parseInt(row.id, 10),
					code: row.code,
					description: row.description,
				});
			})
			.on("end", async () => {
				try {
					await prisma.usdaFoodCategory.createMany({
						data: categories,
						skipDuplicates: true,
					});
					console.log(`Seeded ${categories.length} food categories`);
					resolve();
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedMeasureUnits() {
	console.log("Seeding measure units...");
	const units: Prisma.UsdaMeasureUnitCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "measure_unit.csv"))
			.pipe(csv())
			.on("data", (row) => {
				units.push({
					id: parseInt(row.id, 10),
					name: row.name,
				});
			})
			.on("end", async () => {
				try {
					await prisma.usdaMeasureUnit.createMany({
						data: units,
						skipDuplicates: true,
					});
					console.log(`Seeded ${units.length} measure units`);
					resolve();
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedNutrients() {
	console.log("Seeding nutrients...");
	const nutrients: Prisma.UsdaNutrientCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "nutrient.csv"))
			.pipe(csv())
			.on("data", (row) => {
				nutrients.push({
					id: parseInt(row.id, 10),
					name: row.name,
					unitName: row.unit_name,
					nutrientNbr: row.nutrient_nbr,
					rank: row.rank ? parseFloat(row.rank) : null,
				});
			})
			.on("end", async () => {
				try {
					await prisma.usdaNutrient.createMany({
						data: nutrients,
						skipDuplicates: true,
					});
					console.log(`Seeded ${nutrients.length} nutrients`);
					resolve();
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedFoods() {
	console.log("Seeding foods...");
	const foods: Prisma.UsdaFoodCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "food.csv"))
			.pipe(csv())
			.on("data", (row) => {
				foods.push({
					fdcId: parseInt(row.fdc_id, 10),
					dataType: row.data_type,
					description: row.description,
					foodCategoryId: row.food_category_id
						? parseInt(row.food_category_id, 10)
						: null,
					publicationDate: row.publication_date
						? new Date(row.publication_date)
						: null,
				});
			})
			.on("end", async () => {
				// Get existing category IDs to filter valid foods
				const existingCategoryIds = new Set(
					(
						await prisma.usdaFoodCategory.findMany({ select: { id: true } })
					).map((c) => c.id),
				);
				const validFoods = foods.filter(
					(food) =>
						food.foodCategoryId === null ||
						existingCategoryIds.has(food.foodCategoryId as number),
				);
				console.log(
					`Filtered out ${foods.length - validFoods.length} foods with invalid category IDs`,
				);

				// Process in batches to avoid memory issues
				const batchSize = 1000;
				for (let i = 0; i < validFoods.length; i += batchSize) {
					const batch = validFoods.slice(i, i + batchSize);
					try {
						await prisma.usdaFood.createMany({
							data: batch,
							skipDuplicates: true,
						});
						console.log(
							`Seeded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validFoods.length / batchSize)}`,
						);
					} catch (error) {
						console.error(
							`Error seeding batch ${Math.floor(i / batchSize) + 1}:`,
							error,
						);
					}
				}
				console.log(`Seeded ${validFoods.length} foods`);
				resolve();
			})
			.on("error", reject);
	});
}

async function seedFoodNutrients() {
	console.log("Seeding food nutrients...");
	const foodNutrients: Prisma.UsdaFoodNutrientCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "food_nutrient.csv"))
			.pipe(csv())
			.on("data", (row) => {
				foodNutrients.push({
					id: parseInt(row.id, 10),
					fdcId: parseInt(row.fdc_id, 10),
					nutrientId: parseInt(row.nutrient_id, 10),
					amount: row.amount ? parseFloat(row.amount) : null,
					dataPoints: row.data_points ? parseInt(row.data_points, 10) : null,
					derivationId: row.derivation_id
						? parseInt(row.derivation_id, 10)
						: null,
					min: row.min ? parseFloat(row.min) : null,
					max: row.max ? parseFloat(row.max) : null,
					median: row.median ? parseFloat(row.median) : null,
					loq: row.loq || null,
					footnote: row.footnote || null,
					minYearAcquired: row.min_year_acquired
						? parseInt(row.min_year_acquired, 10)
						: null,
					percentDailyValue: row.percent_daily_value
						? parseFloat(row.percent_daily_value)
						: null,
				});
			})
			.on("end", async () => {
				// Process in batches
				const batchSize = 5000;
				for (let i = 0; i < foodNutrients.length; i += batchSize) {
					const batch = foodNutrients.slice(i, i + batchSize);
					try {
						await prisma.usdaFoodNutrient.createMany({
							data: batch,
							skipDuplicates: true,
						});
						console.log(
							`Seeded food nutrients batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(foodNutrients.length / batchSize)}`,
						);
					} catch (error) {
						console.error(
							`Error seeding food nutrients batch ${Math.floor(i / batchSize) + 1}:`,
							error,
						);
					}
				}
				console.log(`Seeded ${foodNutrients.length} food nutrients`);
				resolve();
			})
			.on("error", reject);
	});
}

async function seedFoodPortions() {
	console.log("Seeding food portions...");
	const foodPortions: Prisma.UsdaFoodPortionCreateManyInput[] = [];

	return new Promise<void>((resolve, reject) => {
		fs.createReadStream(path.join(DATA_DIR, "food_portion.csv"))
			.pipe(csv())
			.on("data", (row) => {
				foodPortions.push({
					id: parseInt(row.id, 10),
					fdcId: parseInt(row.fdc_id, 10),
					seqNum: parseInt(row.seq_num, 10),
					amount: row.amount ? parseFloat(row.amount) : null,
					measureUnitId: row.measure_unit_id
						? parseInt(row.measure_unit_id, 10)
						: null,
					portionDescription: row.portion_description || null,
					modifier: row.modifier || null,
					gramWeight: row.gram_weight ? parseFloat(row.gram_weight) : null,
					dataPoints: row.data_points ? parseInt(row.data_points, 10) : null,
					footnote: row.footnote || null,
					minYearAcquired: row.min_year_acquired
						? parseInt(row.min_year_acquired, 10)
						: null,
				});
			})
			.on("end", async () => {
				// Process in batches
				const batchSize = 1000;
				for (let i = 0; i < foodPortions.length; i += batchSize) {
					const batch = foodPortions.slice(i, i + batchSize);
					try {
						await prisma.usdaFoodPortion.createMany({
							data: batch,
							skipDuplicates: true,
						});
						console.log(
							`Seeded food portions batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(foodPortions.length / batchSize)}`,
						);
					} catch (error) {
						console.error(
							`Error seeding food portions batch ${Math.floor(i / batchSize) + 1}:`,
							error,
						);
					}
				}
				console.log(`Seeded ${foodPortions.length} food portions`);
				resolve();
			})
			.on("error", reject);
	});
}

async function seedRecipes() {
	console.log("Seeding recipes...");

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

	const recipes = [
		{
			name: "Grilled Salmon with Asparagus",
			description:
				"A healthy and delicious salmon dish packed with omega-3 fatty acids and fresh vegetables.",
			image: "https://picsum.photos/400/300?random=1",
			category: "Dinner",
			cuisine: "American",
			prepTime: 10,
			cookTime: 15,
			servings: 2,
			difficulty: "Easy",
			calories: 420,
			nutrition: {
				protein: 35,
				carbs: 8,
				fat: 28,
				fiber: 4,
				sugar: 3,
			},
			ingredients: [
				{
					id: "1",
					name: "Salmon fillet",
					amount: 8,
					unit: "oz",
					notes: "skin-on",
				},
				{
					id: "2",
					name: "Asparagus",
					amount: 1,
					unit: "bunch",
					notes: "trimmed",
				},
				{ id: "3", name: "Olive oil", amount: 2, unit: "tbsp" },
				{
					id: "4",
					name: "Lemon",
					amount: 1,
					unit: "whole",
					notes: "juiced and zested",
				},
				{ id: "5", name: "Garlic", amount: 2, unit: "cloves", notes: "minced" },
				{ id: "6", name: "Salt", amount: 1, unit: "tsp" },
				{
					id: "7",
					name: "Black pepper",
					amount: 0.5,
					unit: "tsp",
					notes: "freshly ground",
				},
			],
			instructions: [
				"Preheat grill to medium-high heat (about 400°F).",
				"Pat salmon dry and season both sides with salt and pepper.",
				"In a small bowl, whisk together olive oil, lemon juice, lemon zest, and minced garlic.",
				"Brush asparagus with half the olive oil mixture and season with salt.",
				"Brush salmon with remaining olive oil mixture.",
				"Place salmon skin-side down on grill and asparagus alongside.",
				"Grill salmon for 4-5 minutes per side, or until internal temperature reaches 145°F.",
				"Grill asparagus for 6-8 minutes, turning occasionally until tender-crisp.",
				"Serve immediately with lemon wedges.",
			],
			tags: ["healthy", "omega-3", "grilled", "low-carb", "high-protein"],
		},
		{
			name: "Lemon Herb Chicken Salad",
			description:
				"A light and refreshing chicken salad with fresh herbs and a tangy lemon dressing.",
			image: "https://picsum.photos/400/300?random=2",
			category: "Lunch",
			cuisine: "Mediterranean",
			prepTime: 15,
			cookTime: 0,
			servings: 2,
			difficulty: "Easy",
			calories: 320,
			nutrition: {
				protein: 28,
				carbs: 12,
				fat: 18,
				fiber: 3,
				sugar: 4,
			},
			ingredients: [
				{
					id: "1",
					name: "Grilled chicken breast",
					amount: 8,
					unit: "oz",
					notes: "cooked and diced",
				},
				{ id: "2", name: "Mixed greens", amount: 4, unit: "cups" },
				{
					id: "3",
					name: "Cherry tomatoes",
					amount: 1,
					unit: "cup",
					notes: "halved",
				},
				{
					id: "4",
					name: "Cucumber",
					amount: 1,
					unit: "medium",
					notes: "sliced",
				},
				{
					id: "5",
					name: "Red onion",
					amount: 0.25,
					unit: "cup",
					notes: "thinly sliced",
				},
				{
					id: "6",
					name: "Fresh parsley",
					amount: 0.25,
					unit: "cup",
					notes: "chopped",
				},
				{
					id: "7",
					name: "Fresh mint",
					amount: 2,
					unit: "tbsp",
					notes: "chopped",
				},
				{ id: "8", name: "Lemon juice", amount: 2, unit: "tbsp" },
				{ id: "9", name: "Olive oil", amount: 2, unit: "tbsp" },
				{ id: "10", name: "Dijon mustard", amount: 1, unit: "tsp" },
				{ id: "11", name: "Salt", amount: 0.5, unit: "tsp" },
				{ id: "12", name: "Black pepper", amount: 0.25, unit: "tsp" },
			],
			instructions: [
				"In a large bowl, whisk together lemon juice, olive oil, Dijon mustard, salt, and pepper.",
				"Add diced chicken, cherry tomatoes, cucumber, red onion, parsley, and mint to the bowl.",
				"Toss everything together until well coated with the dressing.",
				"Divide mixed greens onto two plates.",
				"Top each plate with the chicken salad mixture.",
				"Serve immediately.",
			],
			tags: ["healthy", "salad", "chicken", "fresh", "light"],
		},
		{
			name: "Mediterranean Quinoa Bowl",
			description:
				"A nutritious and colorful quinoa bowl with Mediterranean flavors and fresh vegetables.",
			image: "https://picsum.photos/400/300?random=3",
			category: "Lunch",
			cuisine: "Mediterranean",
			prepTime: 15,
			cookTime: 15,
			servings: 2,
			difficulty: "Easy",
			calories: 380,
			nutrition: {
				protein: 12,
				carbs: 45,
				fat: 16,
				fiber: 6,
				sugar: 8,
			},
			ingredients: [
				{ id: "1", name: "Quinoa", amount: 0.75, unit: "cup", notes: "rinsed" },
				{ id: "2", name: "Water", amount: 1.5, unit: "cups" },
				{
					id: "3",
					name: "Cherry tomatoes",
					amount: 1,
					unit: "cup",
					notes: "halved",
				},
				{
					id: "4",
					name: "Cucumber",
					amount: 1,
					unit: "medium",
					notes: "diced",
				},
				{
					id: "5",
					name: "Red onion",
					amount: 0.25,
					unit: "cup",
					notes: "diced",
				},
				{
					id: "6",
					name: "Kalamata olives",
					amount: 0.25,
					unit: "cup",
					notes: "pitted and halved",
				},
				{
					id: "7",
					name: "Feta cheese",
					amount: 0.25,
					unit: "cup",
					notes: "crumbled",
				},
				{
					id: "8",
					name: "Fresh parsley",
					amount: 0.25,
					unit: "cup",
					notes: "chopped",
				},
				{ id: "9", name: "Lemon juice", amount: 2, unit: "tbsp" },
				{ id: "10", name: "Olive oil", amount: 2, unit: "tbsp" },
				{ id: "11", name: "Dried oregano", amount: 0.5, unit: "tsp" },
				{ id: "12", name: "Salt", amount: 0.5, unit: "tsp" },
				{ id: "13", name: "Black pepper", amount: 0.25, unit: "tsp" },
			],
			instructions: [
				"Rinse quinoa under cold water until water runs clear.",
				"In a medium saucepan, bring water to a boil. Add quinoa, reduce heat to low, cover, and simmer for 15 minutes.",
				"Remove from heat and let stand, covered, for 5 minutes. Fluff with a fork.",
				"In a large bowl, whisk together lemon juice, olive oil, oregano, salt, and pepper.",
				"Add cooked quinoa, cherry tomatoes, cucumber, red onion, olives, and parsley to the bowl.",
				"Toss everything together until well coated.",
				"Divide into two bowls and top each with crumbled feta cheese.",
				"Serve warm or at room temperature.",
			],
			tags: ["healthy", "vegetarian", "quinoa", "mediterranean", "bowl"],
		},
	];

	for (const recipe of recipes) {
		// Check if recipe already exists by name
		const existingRecipe = await prisma.recipe.findFirst({
			where: { name: recipe.name },
		});

		if (existingRecipe) {
			// Update existing recipe
			await prisma.recipe.update({
				where: { id: existingRecipe.id },
				data: recipe,
			});
		} else {
			// Create new recipe
			await prisma.recipe.create({
				data: {
					...recipe,
					userId: systemUser.id,
					createdBy: systemUser.name || "System",
				},
			});
		}
	}

	console.log(`Seeded ${recipes.length} recipes`);
}

async function main() {
	try {
		console.log("Starting USDA FoodData Central seeding...");

		// Seed in dependency order
		await seedFoodCategories();
		await seedMeasureUnits();
		await seedNutrients();
		await seedFoods();
		await seedFoodNutrients();
		await seedFoodPortions();
		await seedRecipes();

		console.log("Seeding completed successfully!");
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
