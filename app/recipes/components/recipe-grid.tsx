"use client";

import { Bookmark, BookmarkCheck, Clock, Flame, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/types/recipe";

interface RecipeGridProps {
	recipes: Recipe[];
	loading: boolean;
	savedIds: Set<string>;
	toggleSave: (recipeId: string) => void;
}

export function RecipeGrid({ recipes, loading, savedIds, toggleSave }: RecipeGridProps) {
	if (loading) {
		return (
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, i) => (
					<Card key={i} className="overflow-hidden">
						<div className="aspect-square bg-muted animate-pulse" />
						<CardContent className="p-4 space-y-3">
							<div className="space-y-2">
								<div className="h-4 bg-muted animate-pulse rounded" />
								<div className="h-3 bg-muted animate-pulse rounded w-3/4" />
							</div>
							<div className="flex gap-4">
								<div className="h-3 bg-muted animate-pulse rounded w-16" />
								<div className="h-3 bg-muted animate-pulse rounded w-12" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (recipes.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No recipes found.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{recipes.map((recipe) => (
				<Link key={recipe.id} href={`/recipes/${recipe.id}`}>
					<Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
						<div className="relative aspect-square overflow-hidden">
							<Image
								src={recipe.image || "/placeholder.svg"}
								alt={recipe.name}
								fill
								className="object-cover group-hover:scale-105 transition-transform duration-300"
							/>
							<Button
								size="icon"
								className="absolute top-3 right-3 rounded-full shadow-lg bg-background hover:bg-background/80"
								variant="secondary"
								onClick={(e) => {
									e.preventDefault();
									toggleSave(recipe.id);
								}}
								aria-label={
									savedIds.has(recipe.id) ? "Unsave recipe" : "Save recipe"
								}
							>
								{savedIds.has(recipe.id) ? (
									<BookmarkCheck className="w-4 h-4" />
								) : (
									<Bookmark className="w-4 h-4" />
								)}
							</Button>
						</div>
						<CardContent className="p-4 space-y-3">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<Badge variant="secondary" className="text-xs">
										{recipe.category}
									</Badge>
									<Badge variant="outline" className="text-xs">
										{recipe.difficulty}
									</Badge>
								</div>
								<h3 className="font-semibold font-display text-lg">
									{recipe.name}
								</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">
									{recipe.description}
								</p>
							</div>
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<div className="flex items-center gap-1">
									<Flame className="w-4 h-4" />
									<span>{recipe.calories} kcal</span>
								</div>
								<div className="flex items-center gap-1">
									<Clock className="w-4 h-4" />
									<span>{recipe.prepTime + recipe.cookTime} min</span>
								</div>
								<div className="flex items-center gap-1">
									<Users className="w-4 h-4" />
									<span>{recipe.servings} servings</span>
								</div>
							</div>
							<div className="flex flex-wrap gap-1">
								{recipe.tags.slice(0, 3).map((tag: string) => (
									<Badge key={tag} variant="outline" className="text-xs">
										{tag}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}