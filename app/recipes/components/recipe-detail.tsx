"use client";

import {
	ArrowLeft,
	Bookmark,
	BookmarkCheck,
	CheckCircle,
	ChefHat,
	Clock,
	Flame,
	Search,
	Users,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AddEntryModal } from "@/components/add-entry-modal";
// Badge component no longer used in this file; using inline pill spans for hero labels and tag buttons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import type { Recipe } from "@/types/recipe";

function getYouTubeVideoId(url: string): string {
	// Handle various YouTube URL formats
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/youtube\.com\/v\/([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	// If it's already just the video ID, return it
	return url;
}

interface RecipeDetailProps {
	recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
	const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
		new Set(),
	);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [modalDefaultTab, setModalDefaultTab] = useState<
		"quick-add" | "log-food"
	>("log-food");

	const toggleIngredient = (ingredientId: string) => {
		const newChecked = new Set(checkedIngredients);
		if (newChecked.has(ingredientId)) {
			newChecked.delete(ingredientId);
		} else {
			newChecked.add(ingredientId);
		}
		setCheckedIngredients(newChecked);
	};

	const totalTime = recipe.prepTime + recipe.cookTime;
	const checkedCount = checkedIngredients.size;
	const totalIngredients = recipe.ingredients.length;
	const progressPercent = (checkedCount / totalIngredients) * 100;

	// Quick Add state (placed inside component)
	const [showQuickAdd, setShowQuickAdd] = useState(false);
	const [quickCalories, setQuickCalories] = useState<number>(
		Math.round(recipe.calories || 0),
	);
	const [quickServings, setQuickServings] = useState<string>("1");
	const [quickProtein, setQuickProtein] = useState<number>(
		Math.round(recipe.nutrition.protein || 0),
	);
	const [quickCarbs, setQuickCarbs] = useState<number>(
		Math.round(recipe.nutrition.carbs || 0),
	);
	const [quickFat, setQuickFat] = useState<number>(
		Math.round(recipe.nutrition.fat || 0),
	);
	const [quickMealType, setQuickMealType] = useState<
		"breakfast" | "lunch" | "dinner" | "snacks"
	>("breakfast");
	const [isQuickAdding, setIsQuickAdding] = useState(false);

	const addMealEntry = useStore((s) => s.addMealEntry);
	const router = useRouter();

	// Saved toggle state
	const [isSaved, setIsSaved] = useState(false);
	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch("/api/saved-recipes", { cache: "no-store" });
				if (res.ok) {
					const ids: string[] = await res.json();
					setIsSaved(ids.includes(recipe.id));
				}
			} catch {
				// ignore
			}
		};
		load();
	}, [recipe.id]);

	const toggleSave = async () => {
		const next = !isSaved;
		setIsSaved(next);
		try {
			const res = await fetch("/api/saved-recipes", {
				method: next ? "POST" : "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ recipeId: recipe.id }),
			});
			if (!res.ok) throw new Error("save failed");
		} catch {
			setIsSaved(!next);
		}
	};

	const handleQuickAdd = useCallback(async () => {
		setIsQuickAdding(true);
		try {
			const payload = {
				date: new Date().toISOString().split("T")[0],
				mealType: quickMealType,
				servings: Number.parseFloat(quickServings) || 1,
				calories: quickCalories,
				protein: quickProtein,
				carbs: quickCarbs,
				fat: quickFat,
			};

			const resp = await fetch("/api/meal-entries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (resp.ok) {
				const created = await resp.json();
				addMealEntry(created);
				setShowQuickAdd(false);
				router.refresh();
			} else {
				console.error("Quick add failed", await resp.text());
			}
		} catch (err) {
			console.error("Quick add error", err);
		} finally {
			setIsQuickAdding(false);
		}
	}, [
		quickCalories,
		quickProtein,
		quickCarbs,
		quickFat,
		quickServings,
		quickMealType,
		addMealEntry,
		router,
	]);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Back Button */}
			<div className="flex items-center justify-between mb-4">
				<Button variant="ghost" asChild>
					<Link href="/recipes">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Recipes
					</Link>
				</Button>
				<Button onClick={toggleSave} variant="secondary" size="sm">
					{isSaved ? (
						<>
							<BookmarkCheck className="w-4 h-4 mr-2" /> Saved
						</>
					) : (
						<>
							<Bookmark className="w-4 h-4 mr-2" /> Save for later
						</>
					)}
				</Button>
			</div>

			{/* Hero Section */}
			<div className="relative aspect-video rounded-lg overflow-hidden">
				<Image
					src={recipe.image || "/placeholder.svg"}
					alt={recipe.name}
					fill
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
				<div className="absolute bottom-6 left-6 right-6">
					{/* Make these labels more legible on top of the hero image */}
					<div className="flex flex-wrap gap-2 mb-3">
						<div className="inline-flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
							<Link
								href={`/recipes?category=${encodeURIComponent(recipe.category)}`}
								className="text-xs font-medium text-white/95 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 transition"
							>
								{recipe.category}
							</Link>
							<Link
								href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine || "")}`}
								className="text-xs font-medium text-white/95 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 transition"
							>
								{recipe.cuisine}
							</Link>
							<Link
								href={`/recipes?difficulty=${encodeURIComponent(recipe.difficulty)}`}
								className="text-xs font-medium text-white/95 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 transition"
							>
								{recipe.difficulty}
							</Link>
						</div>
					</div>
					<h1 className="text-3xl font-bold font-display text-white mb-2">
						{recipe.name}
					</h1>
					<p className="text-white/90 text-lg">{recipe.description}</p>
				</div>
			</div>

			{/* Quick Info */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
						<div className="text-2xl font-bold">{recipe.calories}</div>
						<div className="text-sm text-muted-foreground">calories</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
						<div className="text-2xl font-bold">{totalTime}</div>
						<div className="text-sm text-muted-foreground">minutes</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
						<div className="text-2xl font-bold">{recipe.servings}</div>
						<div className="text-sm text-muted-foreground">servings</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<ChefHat className="w-6 h-6 mx-auto mb-2 text-purple-500" />
						<div className="text-2xl font-bold">{recipe.difficulty}</div>
						<div className="text-sm text-muted-foreground">difficulty</div>
					</CardContent>
				</Card>
			</div>

			{/* Nutrition Info */}
			<Card>
				<CardHeader>
					<CardTitle>Nutrition per Serving</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{recipe.nutrition.protein}g
							</div>
							<div className="text-sm text-muted-foreground">Protein</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{recipe.nutrition.carbs}g
							</div>
							<div className="text-sm text-muted-foreground">Carbs</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-yellow-600">
								{recipe.nutrition.fat}g
							</div>
							<div className="text-sm text-muted-foreground">Fat</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">
								{recipe.nutrition.fiber || 0}g
							</div>
							<div className="text-sm text-muted-foreground">Fiber</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid md:grid-cols-2 gap-6">
				{/* Ingredients */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Ingredients
							{checkedCount > 0 && (
								<span className="text-sm text-muted-foreground">
									{checkedCount}/{totalIngredients} checked
								</span>
							)}
						</CardTitle>
						{checkedCount > 0 && (
							<Progress value={progressPercent} className="h-2" />
						)}
					</CardHeader>
					<CardContent className="space-y-3">
						{recipe.ingredients.map((ingredient) => (
							<button
								key={ingredient.id}
								type="button"
								className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer w-full text-left"
								onClick={() => toggleIngredient(ingredient.id)}
							>
								<div className="w-6 h-6 shrink-0">
									{checkedIngredients.has(ingredient.id) ? (
										<CheckCircle className="w-4 h-4 text-green-600" />
									) : (
										<div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
									)}
								</div>
								<div
									className={`flex-1 ${checkedIngredients.has(ingredient.id) ? "line-through text-muted-foreground" : ""}`}
								>
									<span className="font-medium">
										{ingredient.amount} {ingredient.unit}
									</span>
									<span className="ml-2">{ingredient.name}</span>
									{ingredient.notes && (
										<span className="text-sm text-muted-foreground ml-2">
											({ingredient.notes})
										</span>
									)}
								</div>
							</button>
						))}
					</CardContent>
				</Card>

				{/* Instructions */}
				<Card>
					<CardHeader>
						<CardTitle>Instructions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{recipe.instructions.map((instruction, index) => (
							<div key={index} className="flex gap-4">
								<div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
									{index + 1}
								</div>
								<p className="flex-1 pt-1">{instruction}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* YouTube Video */}
			{recipe.youtube && (
				<Card>
					<CardHeader>
						<CardTitle>Demonstration Video</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="aspect-video rounded-lg overflow-hidden">
							<iframe
								src={`https://www.youtube.com/embed/${getYouTubeVideoId(recipe.youtube)}`}
								title={`${recipe.name} demonstration`}
								className="w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tags */}
			<Card>
				<CardHeader>
					<CardTitle>Tags</CardTitle>
				</CardHeader>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-2">
						{recipe.tags.map((tag) => (
							<Button
								key={tag}
								variant="outline"
								size="sm"
								className="rounded-full px-4 py-2 h-auto text-sm font-medium border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
								asChild
							>
								<Link href={`/recipes?tag=${encodeURIComponent(tag)}`}>
									{tag}
								</Link>
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Add to Meal & Quick Add */}
			<div className="flex flex-col items-center gap-4">
				<Card className="w-full max-w-2xl">
					<CardHeader>
						<CardTitle className="text-center">Add Recipe to Meals</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground text-center mb-4">
							How would you like to add this recipe to your meals?
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button
								onClick={() => {
									setModalDefaultTab("quick-add");
									setIsAddModalOpen(true);
								}}
								className="flex-1"
								size="lg"
							>
								<Zap className="w-4 h-4 mr-2" />
								Quick Add Calories & Macros
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setModalDefaultTab("log-food");
									setIsAddModalOpen(true);
								}}
								className="flex-1"
								size="lg"
							>
								<Search className="w-4 h-4 mr-2" />
								Search for Recipe in Database
							</Button>
						</div>
					</CardContent>
				</Card>

				{showQuickAdd && (
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Quick Add Calories & Macros</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
								<div>
									<label htmlFor="quick-calories" className="text-xs">
										Calories
									</label>
									<input
										id="quick-calories"
										type="number"
										value={quickCalories}
										onChange={(e) =>
											setQuickCalories(
												Number.parseInt(e.target.value || "0", 10),
											)
										}
										className="w-full p-2 border rounded"
									/>
								</div>
								<div>
									<label htmlFor="quick-servings" className="text-xs">
										Servings
									</label>
									<input
										id="quick-servings"
										type="number"
										step="0.1"
										value={quickServings}
										onChange={(e) => setQuickServings(e.target.value)}
										className="w-full p-2 border rounded"
									/>
								</div>
								<div>
									<label htmlFor="quick-protein" className="text-xs">
										Protein (g)
									</label>
									<input
										id="quick-protein"
										type="number"
										value={quickProtein}
										onChange={(e) =>
											setQuickProtein(Number.parseFloat(e.target.value || "0"))
										}
										className="w-full p-2 border rounded"
									/>
								</div>
								<div>
									<label htmlFor="quick-carbs" className="text-xs">
										Carbs (g)
									</label>
									<input
										id="quick-carbs"
										type="number"
										value={quickCarbs}
										onChange={(e) =>
											setQuickCarbs(Number.parseFloat(e.target.value || "0"))
										}
										className="w-full p-2 border rounded"
									/>
								</div>
								<div>
									<label htmlFor="quick-fat" className="text-xs">
										Fat (g)
									</label>
									<input
										id="quick-fat"
										type="number"
										value={quickFat}
										onChange={(e) =>
											setQuickFat(Number.parseFloat(e.target.value || "0"))
										}
										className="w-full p-2 border rounded"
									/>
								</div>
								<div className="md:col-span-2">
									<label htmlFor="quick-meal" className="text-xs">
										Meal
									</label>
									<select
										id="quick-meal"
										value={quickMealType}
										onChange={(e) => {
											const v = e.target.value as
												| "breakfast"
												| "lunch"
												| "dinner"
												| "snacks";
											setQuickMealType(v);
										}}
										className="w-full p-2 border rounded"
									>
										<option value="breakfast">Breakfast</option>
										<option value="lunch">Lunch</option>
										<option value="dinner">Dinner</option>
										<option value="snacks">Snacks</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => setShowQuickAdd(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleQuickAdd} disabled={isQuickAdding}>
									{isQuickAdding ? "Adding..." : "Add"}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			<AddEntryModal
				open={isAddModalOpen}
				onOpenChange={setIsAddModalOpen}
				initialSearchQuery={recipe.name}
				defaultTab={
					modalDefaultTab as
						| "quick-add"
						| "log-food"
						| "create-food"
						| "create-meal"
				}
				showMealDBWarning={
					recipe.nutrition.note?.includes("Estimated nutrition data") || false
				}
				recipeData={{
					name: recipe.name,
					ingredients: recipe.ingredients,
					calories: recipe.calories,
					protein: recipe.nutrition.protein,
					carbs: recipe.nutrition.carbs,
					fat: recipe.nutrition.fat,
				}}
			/>
		</div>
	);
}
