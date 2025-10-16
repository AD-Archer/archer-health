"use client";

import { Bookmark, Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

export function RecipesHeader() {
	const router = useRouter();
	const sp = useSearchParams();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedCuisine, setSelectedCuisine] = useState("All");
	const [showFilters, setShowFilters] = useState(false);
	const [calorieBand, setCalorieBand] = useState<string>(""); // low | medium | high
	const [caloriesMin, setCaloriesMin] = useState<string>("");
	const [caloriesMax, setCaloriesMax] = useState<string>("");
	const [timeMax, setTimeMax] = useState<string>("");
	const [proteinMin, setProteinMin] = useState<string>("");
	const [carbsMax, setCarbsMax] = useState<string>("");
	const [fatMax, setFatMax] = useState<string>("");
	const [savedOnly, setSavedOnly] = useState<boolean>(false);

	// Initialize state from URL on mount and when URL changes elsewhere
	useEffect(() => {
		const get = (k: string) => sp.get(k) ?? "";
		setSearchQuery(get("search"));
		setSelectedCategory(get("category") || "All");
		setSelectedCuisine(get("cuisine") || "All");
		setCalorieBand(get("calorieBand"));
		setCaloriesMin(get("caloriesMin"));
		setCaloriesMax(get("caloriesMax"));
		setTimeMax(get("timeMax"));
		setProteinMin(get("proteinMin"));
		setCarbsMax(get("carbsMax"));
		setFatMax(get("fatMax"));
		setSavedOnly(get("saved") === "1");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sp]);

	// Debounced URL updater
	const debounceRef = useRef<number | undefined>(undefined);
	const pushParams = useCallback(
		(params: Record<string, string | undefined>) => {
			const usp = new URLSearchParams(window.location.search);
			Object.entries(params).forEach(([key, value]) => {
				if (value && value !== "" && value !== "All") {
					usp.set(key, value);
				} else {
					usp.delete(key);
				}
			});
			const qs = usp.toString();
			router.push(qs ? `?${qs}` : "?", { scroll: false });
		},
		[router],
	);

	const triggerUpdate = useCallback(() => {
		window.clearTimeout(debounceRef.current);
		debounceRef.current = window.setTimeout(() => {
			pushParams({
				search: searchQuery || undefined,
				category: selectedCategory,
				cuisine: selectedCuisine,
				calorieBand: calorieBand || undefined,
				caloriesMin: calorieBand ? undefined : caloriesMin || undefined,
				caloriesMax: calorieBand ? undefined : caloriesMax || undefined,
				timeMax: timeMax || undefined,
				proteinMin: proteinMin || undefined,
				carbsMax: carbsMax || undefined,
				fatMax: fatMax || undefined,
				saved: savedOnly ? "1" : undefined,
			});
		}, 300);
	}, [
		pushParams,
		searchQuery,
		selectedCategory,
		selectedCuisine,
		calorieBand,
		caloriesMin,
		caloriesMax,
		timeMax,
		proteinMin,
		carbsMax,
		fatMax,
		savedOnly,
	]);

	// Trigger updates on relevant state change
	useEffect(() => {
		triggerUpdate();
	}, [triggerUpdate]);

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
					onClick={() => setSavedOnly((v) => !v)}
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
