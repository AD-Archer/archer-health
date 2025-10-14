export interface Recipe {
	id: string;
	name: string;
	description: string;
	image: string;
	category: string;
	cuisine?: string;
	prepTime: number; // in minutes
	cookTime: number; // in minutes
	servings: number;
	difficulty: "Easy" | "Medium" | "Hard";
	calories: number;
	nutrition: {
		protein: number; // grams
		carbs: number; // grams
		fat: number; // grams
		fiber?: number; // grams
		sugar?: number; // grams
		note?: string; // disclaimer for estimated data
	};
	ingredients: RecipeIngredient[];
	instructions: string[];
	tags: string[];
	youtube?: string; // YouTube video URL
	source?: string; // Original recipe source URL
	createdAt: Date;
	updatedAt: Date;
}

export interface RecipeIngredient {
	id: string;
	foodId?: string; // reference to USDA food
	name: string;
	amount: number;
	unit: string;
	notes?: string;
}
