"use client";

import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];
const cuisines = [
	"All",
	"American",
	"Mediterranean",
	"Asian",
	"Italian",
	"Mexican",
];

export function RecipesHeader() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedCuisine, setSelectedCuisine] = useState("All");
	const [showFilters, setShowFilters] = useState(false);

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
				</div>
			)}
		</div>
	);
}
