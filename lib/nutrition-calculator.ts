import type { User } from "@/app/data/data";

export interface NutritionNeeds {
	calories: number;
	macros: {
		protein: number; // grams
		carbs: number; // grams
		fat: number; // grams
	};
	micronutrients: {
		vitaminA: number; // mcg
		vitaminC: number; // mg
		vitaminD: number; // mcg
		vitaminE: number; // mg
		vitaminK: number; // mcg
		thiamin: number; // mg
		riboflavin: number; // mg
		niacin: number; // mg
		vitaminB6: number; // mg
		folate: number; // mcg
		vitaminB12: number; // mcg
		biotin: number; // mcg
		pantothenicAcid: number; // mg
		phosphorus: number; // mg
		iodine: number; // mcg
		magnesium: number; // mg
		zinc: number; // mg
		selenium: number; // mcg
		copper: number; // mg
		manganese: number; // mg
		chromium: number; // mcg
		molybdenum: number; // mcg
		chloride: number; // mg
	};
}

// Mifflin-St Jeor Equation for BMR
function calculateBMR(user: User): number {
	const { gender, age, height, currentWeight } = user;
	const weightKg = currentWeight; // Already in kg
	const heightCm = height; // Already in cm

	if (gender === "male") {
		return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
	} else {
		return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
	}
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(
	bmr: number,
	activityLevel: User["activityLevel"],
): number {
	const activityMultipliers = {
		sedentary: 1.2,
		light: 1.375,
		moderate: 1.55,
		active: 1.725,
		"very-active": 1.9,
	};

	return bmr * activityMultipliers[activityLevel];
}

// Calculate macro needs based on TDEE and goal
function calculateMacros(
	tdee: number,
	goalType: User["goalType"],
	weeklyGoal: number,
	currentWeight: number,
): { protein: number; carbs: number; fat: number; calories: number } {
	let calorieTarget = tdee;

	// Adjust calories based on goal
	if (goalType === "lose" && weeklyGoal > 0) {
		// Calculate weekly calorie deficit needed
		// 1 kg = 7700 calories approximately (3500 calories = ~0.45 kg of fat)
		// weeklyGoal is in kg/week, so deficit = weeklyGoal * 7700 calories
		const weeklyDeficit = weeklyGoal * 7700;
		const dailyDeficit = weeklyDeficit / 7;
		calorieTarget = Math.max(1200, tdee - dailyDeficit); // Don't go below 1200 calories
	} else if (goalType === "gain" && weeklyGoal > 0) {
		// Calculate weekly calorie surplus needed
		const weeklySurplus = weeklyGoal * 7700;
		const dailySurplus = weeklySurplus / 7;
		calorieTarget = tdee + dailySurplus;
	}
	// For maintenance, use TDEE as-is

	// Protein: 1.6-2.2g per kg body weight (higher for active individuals)
	const proteinPerKg = 2.0; // g/kg
	const protein = Math.round(currentWeight * proteinPerKg);

	// Fat: 20-35% of calories (aim for 25%)
	const fatCalories = calorieTarget * 0.25;
	const fat = Math.round(fatCalories / 9); // 9 calories per gram

	// Carbs: remaining calories
	const remainingCalories = calorieTarget - protein * 4 - fat * 9;
	const carbs = Math.max(0, Math.round(remainingCalories / 4));

	return { protein, carbs, fat, calories: Math.round(calorieTarget) };
}

// Calculate micronutrient needs based on RDA values
function calculateMicronutrients(user: User): NutritionNeeds["micronutrients"] {
	const { gender, age } = user;

	// Base RDA values (may need adjustment based on individual factors)
	const rda = {
		vitaminA: gender === "male" ? 900 : 700, // mcg
		vitaminC: gender === "male" ? 90 : 75, // mg
		vitaminD: 15, // mcg (may be higher for some)
		vitaminE: gender === "male" ? 15 : 15, // mg
		vitaminK: gender === "male" ? 120 : 90, // mcg
		thiamin: gender === "male" ? 1.2 : 1.1, // mg
		riboflavin: gender === "male" ? 1.3 : 1.1, // mg
		niacin: gender === "male" ? 16 : 14, // mg
		vitaminB6: gender === "male" ? 1.7 : 1.5, // mg
		folate: 400, // mcg
		vitaminB12: 2.4, // mcg
		biotin: 30, // mcg
		pantothenicAcid: 5, // mg
		phosphorus: 700, // mg
		iodine: 150, // mcg
		magnesium: gender === "male" ? 400 : 310, // mg
		zinc: gender === "male" ? 11 : 8, // mg
		selenium: 55, // mcg
		copper: gender === "male" ? 0.9 : 0.9, // mg
		manganese: gender === "male" ? 2.3 : 1.8, // mg
		chromium: 35, // mcg
		molybdenum: 45, // mcg
		chloride: gender === "male" ? 2300 : 2300, // mg
	};

	// Age adjustments
	if (age >= 51) {
		rda.vitaminB12 = 2.4; // Same for older adults
	}

	return rda;
}

export function calculateNutritionNeeds(user: User): NutritionNeeds {
	const bmr = calculateBMR(user);
	const tdee = calculateTDEE(bmr, user.activityLevel);
	const macros = calculateMacros(
		tdee,
		user.goalType,
		user.weeklyGoal,
		user.currentWeight,
	);
	const micronutrients = calculateMicronutrients(user);

	return {
		calories: macros.calories,
		macros: {
			protein: macros.protein,
			carbs: macros.carbs,
			fat: macros.fat,
		},
		micronutrients,
	};
}
