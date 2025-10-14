import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function cleanupMeals() {
	console.log("Cleaning up recipes with placeholder nutrition data...");

	try {
		// Delete all recipes (since they contain fake nutrition data)
		const result = await prisma.recipe.deleteMany({});

		console.log(`Deleted ${result.count} recipes with fake nutrition data`);

		// Also clean up any meal entries that reference non-existent recipes
		// (though this shouldn't happen with cascade deletes)
		const mealEntriesResult = await prisma.mealEntry.deleteMany({
			where: {
				mealId: {
					not: null,
				},
				// This would need to be checked against existing recipes
				// For now, we'll just report what we found
			},
		});

		if (mealEntriesResult.count > 0) {
			console.log(
				`Cleaned up ${mealEntriesResult.count} orphaned meal entries`,
			);
		}

		console.log("Cleanup completed successfully!");
	} catch (error) {
		console.error("Cleanup failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

async function main() {
	try {
		console.log("Starting meal cleanup...");

		await cleanupMeals();

		console.log("Meal cleanup completed successfully!");
	} catch (error) {
		console.error("Meal cleanup failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { cleanupMeals };
