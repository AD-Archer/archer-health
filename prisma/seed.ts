import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import { type Prisma, PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const DATA_ROOT = path.join(process.cwd(), "data");

// Function to find all CSV files in data and subfolders
function findCsvFiles() {
	const csvPaths: Record<string, string> = {};

	function scanDir(dir: string) {
		const items = fs.readdirSync(dir);
		for (const item of items) {
			const fullPath = path.join(dir, item);
			const stat = fs.statSync(fullPath);
			if (stat.isDirectory()) {
				scanDir(fullPath);
			} else if (item.endsWith(".csv")) {
				const name = path.basename(item, ".csv");
				if (!csvPaths[name] || fullPath.includes("2025-04-24")) {
					// Prefer the latest folder
					csvPaths[name] = fullPath;
				}
			}
		}
	}

	scanDir(DATA_ROOT);
	return csvPaths;
}

async function seedFoodCategories(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding food categories...");
	const startTime = Date.now();
	const categories: Prisma.UsdaFoodCategoryCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.food_category)
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
					let inserted = 0;
					for (const category of categories) {
						await prisma.usdaFoodCategory.upsert({
							where: { id: category.id },
							update: category,
							create: category,
						});
						inserted++;
					}
					const endTime = Date.now();
					const time = (endTime - startTime) / 1000;
					const skipped = 0; // upsert handles updates
					console.log(
						`Seeded ${inserted} food categories (updated existing if any) in ${time} seconds`,
					);
					resolve({ inserted, skipped, filtered: 0, adjusted: 0, time });
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedMeasureUnits(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding measure units...");
	const startTime = Date.now();
	const units: Prisma.UsdaMeasureUnitCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.measure_unit)
			.pipe(csv())
			.on("data", (row) => {
				units.push({
					id: parseInt(row.id, 10),
					name: row.name,
				});
			})
			.on("end", async () => {
				try {
					let inserted = 0;
					for (const unit of units) {
						await prisma.usdaMeasureUnit.upsert({
							where: { id: unit.id },
							update: unit,
							create: unit,
						});
						inserted++;
					}
					const endTime = Date.now();
					const time = (endTime - startTime) / 1000;
					const skipped = 0; // upsert handles updates
					console.log(
						`Seeded ${inserted} measure units (updated existing if any) in ${time} seconds`,
					);
					resolve({ inserted, skipped, filtered: 0, adjusted: 0, time });
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedNutrients(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding nutrients...");
	const startTime = Date.now();
	const nutrients: Prisma.UsdaNutrientCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.nutrient)
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
					let inserted = 0;
					for (const nutrient of nutrients) {
						await prisma.usdaNutrient.upsert({
							where: { nutrientNbr: nutrient.nutrientNbr },
							update: nutrient,
							create: nutrient,
						});
						inserted++;
					}
					const endTime = Date.now();
					const time = (endTime - startTime) / 1000;
					const skipped = 0; // upsert handles updates
					console.log(
						`Seeded ${inserted} nutrients (updated existing if any) in ${time} seconds`,
					);
					resolve({ inserted, skipped, filtered: 0, adjusted: 0, time });
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});
}

async function seedFoods(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding foods...");
	const startTime = Date.now();
	const foods: Prisma.UsdaFoodCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.food)
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
				// Get existing category IDs to validate and fix invalid ones
				const existingCategoryIds = new Set(
					(
						await prisma.usdaFoodCategory.findMany({ select: { id: true } })
					).map((c) => c.id),
				);
				let invalidCategoryCount = 0;
				const processedFoods = foods.map((food) => {
					if (
						food.foodCategoryId !== null &&
						!existingCategoryIds.has(food.foodCategoryId as number)
					) {
						invalidCategoryCount++;
						return { ...food, foodCategoryId: null };
					}
					return food;
				});
				console.log(
					`Set foodCategoryId to null for ${invalidCategoryCount} foods with invalid category IDs (reason: category ID not found in database)`,
				);

				let totalInserted = 0;
				for (const food of processedFoods) {
					try {
						await prisma.usdaFood.upsert({
							where: { fdcId: food.fdcId },
							update: food,
							create: food,
						});
						totalInserted++;
					} catch (error) {
						console.error(`Error upserting food ${food.fdcId}:`, error);
					}
				}
				const endTime = Date.now();
				const time = (endTime - startTime) / 1000;
				console.log(
					`Seeded ${totalInserted} foods (updated existing if any, ${invalidCategoryCount} had invalid categories set to null) in ${time} seconds`,
				);
				resolve({
					inserted: totalInserted,
					skipped: 0, // upsert handles updates
					filtered: 0,
					adjusted: invalidCategoryCount,
					time,
				});
			})
			.on("error", reject);
	});
}

async function seedFoodNutrients(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding food nutrients...");
	const startTime = Date.now();
	const foodNutrients: Prisma.UsdaFoodNutrientCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.food_nutrient)
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
				// Get existing fdcIds to filter valid food nutrients
				const existingFdcIds = new Set(
					(await prisma.usdaFood.findMany({ select: { fdcId: true } })).map(
						(f) => f.fdcId,
					),
				);
				const validFoodNutrients = foodNutrients.filter((nutrient) =>
					existingFdcIds.has(nutrient.fdcId),
				);
				const filtered = foodNutrients.length - validFoodNutrients.length;
				console.log(
					`Filtered out ${filtered} food nutrients with invalid fdcId (reason: food not found in database)`,
				);

				let totalInserted = 0;
				for (const nutrient of validFoodNutrients) {
					try {
						await prisma.usdaFoodNutrient.upsert({
							where: { id: nutrient.id },
							update: nutrient,
							create: nutrient,
						});
						totalInserted++;
					} catch (error) {
						console.error(
							`Error upserting food nutrient ${nutrient.id}:`,
							error,
						);
					}
				}
				const endTime = Date.now();
				const time = (endTime - startTime) / 1000;
				console.log(
					`Seeded ${totalInserted} food nutrients (updated existing if any, ${filtered} filtered out for invalid fdcId) in ${time} seconds`,
				);
				resolve({
					inserted: totalInserted,
					skipped: 0, // upsert handles updates
					filtered,
					adjusted: 0,
					time,
				});
			})
			.on("error", reject);
	});
}

async function seedFoodPortions(): Promise<{
	inserted: number;
	skipped: number;
	filtered: number;
	adjusted: number;
	time: number;
}> {
	console.log("Seeding food portions...");
	const startTime = Date.now();
	const foodPortions: Prisma.UsdaFoodPortionCreateManyInput[] = [];
	const csvPaths = findCsvFiles();

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPaths.food_portion)
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
				// Get existing fdcIds and measureUnitIds
				const existingFdcIds = new Set(
					(await prisma.usdaFood.findMany({ select: { fdcId: true } })).map(
						(f) => f.fdcId,
					),
				);
				const existingMeasureUnitIds = new Set(
					(await prisma.usdaMeasureUnit.findMany({ select: { id: true } })).map(
						(u) => u.id,
					),
				);
				let invalidMeasureUnitCount = 0;
				const processedPortions = foodPortions.map((portion) => {
					if (
						portion.measureUnitId !== null &&
						!existingMeasureUnitIds.has(portion.measureUnitId as number)
					) {
						invalidMeasureUnitCount++;
						return { ...portion, measureUnitId: null };
					}
					return portion;
				});
				console.log(
					`Set measureUnitId to null for ${invalidMeasureUnitCount} portions with invalid measure unit IDs (reason: measure unit ID not found in database)`,
				);
				const validFoodPortions = processedPortions.filter((portion) =>
					existingFdcIds.has(portion.fdcId),
				);
				const filtered = processedPortions.length - validFoodPortions.length;
				console.log(
					`Filtered out ${filtered} food portions with invalid fdcId (reason: food not found in database)`,
				);

				let totalInserted = 0;
				for (const portion of validFoodPortions) {
					try {
						await prisma.usdaFoodPortion.upsert({
							where: { id: portion.id },
							update: portion,
							create: portion,
						});
						totalInserted++;
					} catch (error) {
						console.error(`Error upserting food portion ${portion.id}:`, error);
					}
				}
				const endTime = Date.now();
				const time = (endTime - startTime) / 1000;
				console.log(
					`Seeded ${totalInserted} food portions (updated existing if any, ${filtered} filtered out for invalid fdcId, ${invalidMeasureUnitCount} had invalid measure units set to null) in ${time} seconds`,
				);
				resolve({
					inserted: totalInserted,
					skipped: 0, // upsert handles updates
					filtered,
					adjusted: invalidMeasureUnitCount,
					time,
				});
			})
			.on("error", reject);
	});
}
async function main() {
	const overallStartTime = Date.now();
	try {
		console.log("Starting USDA FoodData Central seeding...");

		// Find CSV files in data directory and subfolders
		const csvPaths = findCsvFiles();
		const foundFiles = Object.keys(csvPaths).map(
			(name) => `${name}.csv (${csvPaths[name]})`,
		);
		console.log(`Found CSV files: ${foundFiles.join(", ")}`);

		// Seed in dependency order
		const categoriesStats = await seedFoodCategories();
		const unitsStats = await seedMeasureUnits();
		const nutrientsStats = await seedNutrients();
		const foodsStats = await seedFoods();
		const foodNutrientsStats = await seedFoodNutrients();
		const foodPortionsStats = await seedFoodPortions();
		const overallEndTime = Date.now();
		const totalTime = (overallEndTime - overallStartTime) / 1000;

		// Summary
		const totalInserted =
			categoriesStats.inserted +
			unitsStats.inserted +
			nutrientsStats.inserted +
			foodsStats.inserted +
			foodNutrientsStats.inserted +
			foodPortionsStats.inserted;
		const totalSkipped =
			categoriesStats.skipped +
			unitsStats.skipped +
			nutrientsStats.skipped +
			foodsStats.skipped +
			foodNutrientsStats.skipped +
			foodPortionsStats.skipped;
		const totalFiltered =
			categoriesStats.filtered +
			unitsStats.filtered +
			nutrientsStats.filtered +
			foodsStats.filtered +
			foodNutrientsStats.filtered +
			foodPortionsStats.filtered;
		const totalAdjusted =
			categoriesStats.adjusted +
			unitsStats.adjusted +
			nutrientsStats.adjusted +
			foodsStats.adjusted +
			foodNutrientsStats.adjusted +
			foodPortionsStats.adjusted;

		console.log(`\n=== Seeding Summary ===`);
		console.log(`Total records inserted/updated: ${totalInserted}`);
		console.log(`Total records skipped (duplicates): ${totalSkipped}`);
		console.log(
			`Total records filtered out (invalid references): ${totalFiltered}`,
		);
		console.log(
			`Total records adjusted (invalid fields set to null): ${totalAdjusted}`,
		);
		console.log(`Total time: ${totalTime} seconds`);
		console.log("Seeding completed successfully!");
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
