"use client";

import { Bookmark, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];
const cuisines = [
	"All",
	"American",
	"Mediterranean",
	"Asian",
	"Italian",
	"Mexican",
];

interface RecipesHeaderProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategory: string;
	setSelectedCategory: (category: string) => void;
	selectedCuisine: string;
	setSelectedCuisine: (cuisine: string) => void;
	showFilters: boolean;
	setShowFilters: (show: boolean) => void;
	calorieBand: string;
	setCalorieBand: (band: string) => void;
	caloriesMin: string;
	setCaloriesMin: (min: string) => void;
	caloriesMax: string;
	setCaloriesMax: (max: string) => void;
	timeMax: string;
	setTimeMax: (max: string) => void;
	proteinMin: string;
	setProteinMin: (min: string) => void;
	carbsMax: string;
	setCarbsMax: (max: string) => void;
	fatMax: string;
	setFatMax: (max: string) => void;
	savedOnly: boolean;
	setSavedOnly: (saved: boolean) => void;
}

export function RecipesHeader({
	searchQuery,
	setSearchQuery,
	selectedCategory,
	setSelectedCategory,
	selectedCuisine,
	setSelectedCuisine,
	showFilters,
	setShowFilters,
	calorieBand,
	setCalorieBand,
	caloriesMin,
	setCaloriesMin,
	caloriesMax,
	setCaloriesMax,
	timeMax,
	setTimeMax,
	proteinMin,
	setProteinMin,
	carbsMax,
	setCarbsMax,
	fatMax,
	setFatMax,
	savedOnly,
	setSavedOnly,
}: RecipesHeaderProps) {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold font-display">Recipes</h1>
				<p className="text-muted-foreground">
					Discover healthy meal ideas and cooking inspiration
				</p>
				<p className="text-sm text-amber-600 mt-2">
					⚠️ Calorie counts are estimates and may vary based on ingredients and
					preparation. Use at your discretion.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search recipes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowFilters(!showFilters)}
					className="shrink-0"
				>
					<Filter className="w-4 h-4 mr-2" />
					Filters
				</Button>
				<Button
					variant={savedOnly ? "default" : "outline"}
					onClick={() => setSavedOnly(!savedOnly)}
					className="shrink-0"
				>
					<Bookmark className="w-4 h-4 mr-2" />
					Saved
				</Button>
			</div>

			{showFilters && (
				<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
					<div>
						<h3 className="font-medium mb-2">Category</h3>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										selectedCategory === category ? "default" : "outline"
									}
									className="cursor-pointer"
									onClick={() => setSelectedCategory(category)}
								>
									{category}
								</Badge>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-medium mb-2">Cuisine</h3>
						<div className="flex flex-wrap gap-2">
							{cuisines.map((cuisine) => (
								<Badge
									key={cuisine}
									variant={selectedCuisine === cuisine ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() => setSelectedCuisine(cuisine)}
								>
									{cuisine}
								</Badge>
							))}
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2">
							<h3 className="font-medium">Calorie band</h3>
							<Select
								value={calorieBand || "none"}
								onValueChange={(v) => setCalorieBand(v === "none" ? "" : v)}
							>
								<SelectTrigger>
									<SelectValue placeholder="None" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="low">Low (≤ 350 kcal)</SelectItem>
									<SelectItem value="medium">Medium (351–600 kcal)</SelectItem>
									<SelectItem value="high">High (≥ 601 kcal)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium">Calories range</h3>
							<div className="flex gap-2">
								<Input
									inputMode="numeric"
									type="number"
									placeholder="Min"
									value={caloriesMin}
									onChange={(e) => setCaloriesMin(e.target.value)}
									disabled={!!calorieBand}
								/>
								<Input
									inputMode="numeric"
									type="number"
									placeholder="Max"
									value={caloriesMax}
									onChange={(e) => setCaloriesMax(e.target.value)}
									disabled={!!calorieBand}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium">Max total time (min)</h3>
							<Input
								inputMode="numeric"
								type="number"
								placeholder="e.g. 30"
								value={timeMax}
								onChange={(e) => setTimeMax(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium">Protein min (g)</h3>
							<Input
								inputMode="numeric"
								type="number"
								placeholder="e.g. 20"
								value={proteinMin}
								onChange={(e) => setProteinMin(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<h3 className="font-medium">Carbs max (g)</h3>
							<Input
								inputMode="numeric"
								type="number"
								placeholder="e.g. 40"
								value={carbsMax}
								onChange={(e) => setCarbsMax(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<h3 className="font-medium">Fat max (g)</h3>
							<Input
								inputMode="numeric"
								type="number"
								placeholder="e.g. 20"
								value={fatMax}
								onChange={(e) => setFatMax(e.target.value)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}