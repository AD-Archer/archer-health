"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Recipe } from "@/types/recipe";
import { RecipeGrid } from "./recipe-grid";
import { RecipesHeader } from "./recipes-header";

export function RecipesContainer() {
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState(true);
	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
	const sp = useSearchParams();
	const router = useRouter();
	const abortRef = useRef<AbortController | null>(null);

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
	}, [sp]);

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

	useEffect(() => {
		triggerUpdate();
	}, [triggerUpdate]);

	useEffect(() => {
		const fetchRecipes = async () => {
			setLoading(true);
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			try {
				const qs = sp.toString();
				const url = qs ? `/api/recipes?${qs}` : "/api/recipes";
				const response = await fetch(url, {
					signal: controller.signal,
					cache: "no-store",
				});
				if (response.ok) {
					const data = await response.json();
					setRecipes(data);
				}
			} catch (error) {
				if ((error as unknown as { name?: string })?.name !== "AbortError") {
					console.error("Error fetching recipes:", error);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchRecipes();
		return () => abortRef.current?.abort();
	}, [sp]);

	useEffect(() => {
		const fetchSaved = async () => {
			try {
				const res = await fetch("/api/saved-recipes", { cache: "no-store" });
				if (res.ok) {
					const ids: string[] = await res.json();
					setSavedIds(new Set(ids));
				}
			} catch {
				// ignore network errors
			}
		};
		fetchSaved();
	}, []);

	const toggleSave = async (recipeId: string) => {
		const optimistic = new Set(savedIds);
		const isSaved = optimistic.has(recipeId);
		if (isSaved) optimistic.delete(recipeId);
		else optimistic.add(recipeId);
		setSavedIds(optimistic);
		try {
			const res = await fetch("/api/saved-recipes", {
				method: isSaved ? "DELETE" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ recipeId }),
			});
			if (!res.ok) throw new Error("Request failed");
		} catch {
			// revert on failure
			const revert = new Set(savedIds);
			setSavedIds(revert);
		}
	};

	return (
		<>
			<RecipesHeader
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
				selectedCuisine={selectedCuisine}
				setSelectedCuisine={setSelectedCuisine}
				showFilters={showFilters}
				setShowFilters={setShowFilters}
				calorieBand={calorieBand}
				setCalorieBand={setCalorieBand}
				caloriesMin={caloriesMin}
				setCaloriesMin={setCaloriesMin}
				caloriesMax={caloriesMax}
				setCaloriesMax={setCaloriesMax}
				timeMax={timeMax}
				setTimeMax={setTimeMax}
				proteinMin={proteinMin}
				setProteinMin={setProteinMin}
				carbsMax={carbsMax}
				setCarbsMax={setCarbsMax}
				fatMax={fatMax}
				setFatMax={setFatMax}
				savedOnly={savedOnly}
				setSavedOnly={setSavedOnly}
			/>
			<RecipeGrid
				recipes={recipes}
				loading={loading}
				savedIds={savedIds}
				toggleSave={toggleSave}
			/>
		</>
	);
}
