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

		console.log("Seeding completed successfully!");
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
