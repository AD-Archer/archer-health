"use client";

import {
	Bookmark,
	CheckCircle,
	Clock,
	Edit,
	Flame,
	Plus,
	Search,
	Star,
	Users,
	Utensils,
	Zap,
} from "lucide-react";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import type { Food, MealEntry } from "@/app/data/data";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type AddEntryTab =
	| "log-food"
	| "quick-add"
	| "recent-foods"
	| "my-foods"
	| "saved-foods"
	| "create-food"
	| "create-meal";

interface AddEntryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedDate?: Date;
	initialSearchQuery?: string;
	showMealDBWarning?: boolean;
	defaultTab?: AddEntryTab;
	recipeData?: {
		name: string;
		ingredients: Array<{
			name: string;
			amount: number;
			unit: string;
		}>;
		calories?: number;
		protein?: number;
		carbs?: number;
		fat?: number;
	};
}

export function AddEntryModal({
	open,
	onOpenChange,
	selectedDate,
	initialSearchQuery,
	showMealDBWarning, // eslint-disable-line @typescript-eslint/no-unused-vars
	recipeData, // eslint-disable-line @typescript-eslint/no-unused-vars
	defaultTab = "log-food",
}: AddEntryModalProps) {
	const selectTabs: AddEntryTab[] = [
		"log-food",
		"quick-add",
		"recent-foods",
		"my-foods",
		"saved-foods",
	];
	const createTabs: AddEntryTab[] = ["create-food", "create-meal"];
	const [activeTab, setActiveTab] = useState<AddEntryTab>(defaultTab);
	const [lastSelectTab, setLastSelectTab] = useState<AddEntryTab>(
		selectTabs.includes(defaultTab) ? defaultTab : "log-food",
	);
	const [lastCreateTab, setLastCreateTab] = useState<AddEntryTab>(
		createTabs.includes(defaultTab) ? defaultTab : "create-food",
	);
	const currentSection = selectTabs.includes(activeTab) ? "select" : "create";

	const handleTabChange = (value: string) => {
		const tabValue = value as AddEntryTab;
		setActiveTab(tabValue);
		if (selectTabs.includes(tabValue)) {
			setLastSelectTab(tabValue);
		} else {
			setLastCreateTab(tabValue);
		}
	};

	const handleSectionChange = (section: "select" | "create") => {
		if (section === "select") {
			setActiveTab(lastSelectTab);
		} else {
			setActiveTab(lastCreateTab);
		}
	};
	const tabTriggerClasses =
		"flex-none justify-center !h-auto px-2 py-2 text-xs font-medium border border-border text-foreground bg-muted/60 hover:bg-muted/80 transition-colors rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm min-w-0 flex-shrink-0 whitespace-nowrap flex items-center";
	const selectTabsListClasses = "w-full bg-transparent p-0 overflow-x-auto scrollbar-hide";
	const createTabsListClasses = "w-full bg-transparent p-0 overflow-x-auto scrollbar-hide";
	const selectTabsListStyle: CSSProperties = {
		display: "flex",
		gap: "0.5rem",
		scrollbarWidth: "none", // Hide scrollbar on Firefox
		msOverflowStyle: "none", // Hide scrollbar on IE/Edge
	};
	const createTabsListStyle: CSSProperties = {
		display: "flex",
		gap: "0.5rem",
		scrollbarWidth: "none",
		msOverflowStyle: "none",
	};

	useEffect(() => {
		setActiveTab(defaultTab);
		if (selectTabs.includes(defaultTab)) {
			setLastSelectTab(defaultTab);
		} else {
			setLastCreateTab(defaultTab);
		}
	}, [defaultTab]);
	// Quick Add state
	const [quickCalories, setQuickCalories] = useState(
		recipeData?.calories?.toString() || "",
	);
	const [quickProtein, setQuickProtein] = useState(
		recipeData?.protein?.toString() || "",
	);
	const [quickCarbs, setQuickCarbs] = useState(
		recipeData?.carbs?.toString() || "",
	);
	const [quickFat, setQuickFat] = useState(recipeData?.fat?.toString() || "");
	const [quickServings, setQuickServings] = useState("1");
	const [quickMealType, setQuickMealType] = useState<
		"breakfast" | "lunch" | "dinner" | "snacks"
	>("breakfast");
	const [isQuickAdding, setIsQuickAdding] = useState(false);
	const addMealEntry = useStore((s) => s.addMealEntry);

	const handleQuickAdd = async () => {
		if (isQuickAdding) return;

		// Validate that calories are provided
		if (!quickCalories || Number(quickCalories) <= 0) {
			console.error("Calories are required for quick add");
			return;
		}

		setIsQuickAdding(true);
		try {
			const servingAmount = Number.parseFloat(quickServings) || 1;
			const payload: Partial<MealEntry> = {
				id: Date.now().toString(),
				date: selectedDate
					? selectedDate.toISOString().split("T")[0]
					: new Date().toISOString().split("T")[0],
				mealType: quickMealType,
				servings: servingAmount,
				calories: (Number(quickCalories) || 0) * servingAmount,
				protein: (Number(quickProtein) || 0) * servingAmount,
				carbs: (Number(quickCarbs) || 0) * servingAmount,
				fat: (Number(quickFat) || 0) * servingAmount,
			};

			const res = await fetch("/api/meal-entries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				const created = await res.json();
				addMealEntry(created);
				onOpenChange(false);
			} else {
				const errorText = await res.text();
				console.error("Quick add failed:", {
					status: res.status,
					statusText: res.statusText,
					body: errorText,
					payload,
				});
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsQuickAdding(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>Add Entry</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-1">
					<Tabs
						value={activeTab}
						onValueChange={(value) => handleTabChange(value)}
						className="flex flex-col h-full"
					>
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									className={cn(
										"h-9 w-full border border-border text-foreground transition-colors",
										currentSection === "select"
											? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary"
											: "bg-background hover:bg-muted/60",
									)}
									onClick={() => handleSectionChange("select")}
								>
									Select
								</Button>
								<Button
									variant="outline"
									size="sm"
									className={cn(
										"h-9 w-full border border-border text-foreground transition-colors",
										currentSection === "create"
											? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary"
											: "bg-background hover:bg-muted/60",
									)}
									onClick={() => handleSectionChange("create")}
								>
									Create
								</Button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto">
							<TabsContent value="quick-add" className="space-y-4">
							<div className="space-y-6">
								{/* Nutrition Inputs */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="flex items-center gap-2 text-sm font-medium">
											<Flame className="w-4 h-4 text-orange-500" />
											Calories <span className="text-red-500">*</span>
										</Label>
										<Input
											type="number"
											value={quickCalories}
											onChange={(e) => setQuickCalories(e.target.value)}
											placeholder="0"
										/>
									</div>
									<div className="space-y-2">
										<Label className="flex items-center gap-2 text-sm font-medium">
											<Users className="w-4 h-4 text-blue-500" />
											Servings
										</Label>
										<Input
											type="number"
											min="0.01"
											step="0.1"
											value={quickServings}
											onChange={(e) => setQuickServings(e.target.value)}
											placeholder="1"
										/>
									</div>
								</div>

								{/* Macros */}
								<div className="space-y-3">
									<h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
										Macronutrients
									</h4>
									<div className="grid grid-cols-3 gap-3">
										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">
												Protein (g)
											</Label>
											<Input
												type="number"
												value={quickProtein}
												onChange={(e) => setQuickProtein(e.target.value)}
												placeholder="0"
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">
												Carbs (g)
											</Label>
											<Input
												type="number"
												value={quickCarbs}
												onChange={(e) => setQuickCarbs(e.target.value)}
												placeholder="0"
											/>
										</div>
										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">
												Fat (g)
											</Label>
											<Input
												type="number"
												value={quickFat}
												onChange={(e) => setQuickFat(e.target.value)}
												placeholder="0"
											/>
										</div>
									</div>
								</div>

								{/* Meal Type */}
								<div className="space-y-2">
									<Label className="flex items-center gap-2 text-sm font-medium">
										<Utensils className="w-4 h-4 text-green-500" />
										Meal Type
									</Label>
									<Select
										value={quickMealType}
										onValueChange={(v: string) =>
											setQuickMealType(
												v as "breakfast" | "lunch" | "dinner" | "snacks",
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="breakfast">Breakfast</SelectItem>
											<SelectItem value="lunch">Lunch</SelectItem>
											<SelectItem value="dinner">Dinner</SelectItem>
											<SelectItem value="snacks">Snacks</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Action Button */}
								<Button
									onClick={handleQuickAdd}
									className="w-full"
									size="lg"
									disabled={!quickCalories || Number(quickCalories) <= 0}
								>
									<Zap className="w-4 h-4 mr-2" />
									{isQuickAdding ? "Adding..." : "Quick Add Entry"}
								</Button>
								<p className="text-xs text-muted-foreground text-center">
									<span className="text-red-500">*</span> Required fields
								</p>
							</div>
						</TabsContent>

						<TabsContent value="recent-foods" className="space-y-4">
							<RecentFoodsTab
								onClose={() => onOpenChange(false)}
								selectedDate={selectedDate}
							/>
						</TabsContent>

						<TabsContent value="my-foods" className="space-y-4">
							<MyFoodsTab
								onClose={() => onOpenChange(false)}
								selectedDate={selectedDate}
							/>
						</TabsContent>

						<TabsContent value="saved-foods" className="space-y-4">
							<MyFoodsTab
								onClose={() => onOpenChange(false)}
								selectedDate={selectedDate}
								variant="saved"
							/>
						</TabsContent>

						<TabsContent value="log-food" className="space-y-4">
							<LogFoodTab
								onClose={() => onOpenChange(false)}
								selectedDate={selectedDate}
								initialSearchQuery={initialSearchQuery}
								showMealDBWarning={showMealDBWarning}
								recipeData={recipeData}
							/>
						</TabsContent>

						<TabsContent value="create-food" className="space-y-4">
							<CreateFoodTab onClose={() => onOpenChange(false)} />
						</TabsContent>

						<TabsContent value="create-meal" className="space-y-4">
							<CreateMealTab onClose={() => onOpenChange(false)} />
						</TabsContent>
						</div>

						{currentSection === "select" ? (
							<TabsList
								className={selectTabsListClasses}
								style={selectTabsListStyle}
							>
								<TabsTrigger value="log-food" className={tabTriggerClasses}>
									<Search className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Log Food</span>
								</TabsTrigger>
								<TabsTrigger value="quick-add" className={tabTriggerClasses}>
									<Zap className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Quick</span>
								</TabsTrigger>
								<TabsTrigger
									value="recent-foods"
									className={tabTriggerClasses}
								>
									<Clock className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Recent</span>
								</TabsTrigger>
								<TabsTrigger value="my-foods" className={tabTriggerClasses}>
									<Users className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">My Foods</span>
								</TabsTrigger>
								<TabsTrigger
									value="saved-foods"
									className={tabTriggerClasses}
								>
									<Bookmark className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Saved</span>
								</TabsTrigger>
							</TabsList>
						) : (
							<TabsList
								className={createTabsListClasses}
								style={createTabsListStyle}
							>
								<TabsTrigger
									value="create-food"
									className={tabTriggerClasses}
								>
									<Plus className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Food</span>
								</TabsTrigger>
								<TabsTrigger
									value="create-meal"
									className={tabTriggerClasses}
								>
									<Utensils className="w-4 h-4 mr-1" />
									<span className="hidden sm:inline">Meal</span>
								</TabsTrigger>
							</TabsList>
						)}
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function LogFoodTab({
	onClose,
	selectedDate,
	initialSearchQuery,
}: {
	onClose: () => void;
	selectedDate?: Date;
	initialSearchQuery?: string;
	showMealDBWarning?: boolean;
	recipeData?: {
		name: string;
		ingredients: Array<{
			name: string;
			amount: number;
			unit: string;
		}>;
		calories?: number;
		protein?: number;
		carbs?: number;
		fat?: number;
	};
}) {
	const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
	const [selectedFood, setSelectedFood] = useState<Food | null>(null);
	const [servings, setServings] = useState("1");
	const [mealType, setMealType] = useState<
		"breakfast" | "lunch" | "dinner" | "snacks"
	>("breakfast");
	const [foods, setFoods] = useState<Food[]>([]);
	const [recentFoods, setRecentFoods] = useState<Food[]>([]);
	const [savedFoodIds, setSavedFoodIds] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingRecent, setIsLoadingRecent] = useState(false);
	const [isLogging, setIsLogging] = useState(false);
	const addMealEntry = useStore((state) => state.addMealEntry);
	const addFood = useStore((state) => state.addFood);

	const handleSaveFood = async (food: Food) => {
		try {
			// For USDA foods, we need to save them to user's collection
			if (food.source === "usda") {
				const isAlreadySaved = savedFoodIds.has(food.id);
				
				if (isAlreadySaved) {
					// Remove from saved foods
					const response = await fetch(`/api/foods/${food.id}`, {
						method: "DELETE",
					});
					
					if (response.ok) {
						setSavedFoodIds(prev => {
							const newSet = new Set(prev);
							newSet.delete(food.id);
							return newSet;
						});
						toast.success("Food removed from your collection!");
					} else {
						toast.error("Error removing food");
					}
				} else {
					// Save to user's collection
					const response = await fetch("/api/foods", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							name: food.name,
							calories: food.calories,
							protein: food.protein,
							carbs: food.carbs,
							fat: food.fat,
							fiber: food.fiber,
							sugar: food.sugar,
							sodium: food.sodium,
							servingSize: food.servingSize,
							servingUnit: food.servingUnit,
							isPublic: false, // User's private copy
							category: food.category,
						}),
					});

					if (response.ok) {
						const savedFood = await response.json();
						addFood(savedFood);
						setSavedFoodIds(prev => new Set(prev).add(savedFood.id));
						toast.success("Food saved to your collection!");
					} else {
						const errorText = await response.text();
						console.error("Error saving food:", errorText);
						toast.error(`Error saving food: ${errorText}`);
					}
				}
			}
		} catch (error) {
			console.error("Error saving food:", error);
			toast.error("Error saving food");
		}
	};

	const loadRecentFoods = useCallback(async () => {
		setIsLoadingRecent(true);
		try {
			// Fetch the 3 most recent user foods
			const response = await fetch("/api/foods?limit=3");
			if (response.ok) {
				const data: Food[] = await response.json();
				setRecentFoods(data.slice(0, 3));
				// Mark user foods as saved
				setSavedFoodIds(prev => {
					const newSet = new Set(prev);
					data.forEach((food: Food) => {
						if (food.source === "user") {
							newSet.add(food.id);
						}
					});
					return newSet;
				});
			}
		} catch (error) {
			console.error("Error loading recent foods:", error);
		} finally {
			setIsLoadingRecent(false);
		}
	}, []);

	const searchFoods = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/foods?q=${encodeURIComponent(searchQuery)}`,
			);
			if (response.ok) {
				const data = await response.json();
				setFoods(data);
				// Mark user foods as saved
				setSavedFoodIds(prev => {
					const newSet = new Set(prev);
					data.forEach((food: Food) => {
						if (food.source === "user") {
							newSet.add(food.id);
						}
					});
					return newSet;
				});
			}
		} catch (error) {
			console.error("Error searching foods:", error);
		} finally {
			setIsLoading(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		loadRecentFoods();
	}, [loadRecentFoods]);

	useEffect(() => {
		if (searchQuery.length > 2) {
			searchFoods();
		} else {
			setFoods([]);
		}
	}, [searchQuery, searchFoods]);

	const handleLogFood = async () => {
		if (!selectedFood) return;

		setIsLogging(true);
		const servingAmount = Number.parseFloat(servings) || 1;
		const entry: MealEntry = {
			id: Date.now().toString(),
			date: selectedDate
				? selectedDate.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0], // Use selectedDate if provided
			mealType,
			foodId: selectedFood.id,
			servings: servingAmount,
			calories: selectedFood.calories * servingAmount,
			protein: selectedFood.protein * servingAmount,
			carbs: selectedFood.carbs * servingAmount,
			fat: selectedFood.fat * servingAmount,
		};

		try {
			const response = await fetch("/api/meal-entries", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(entry),
			});

			if (response.ok) {
				const createdEntry = await response.json();
				addMealEntry(createdEntry);
				onClose();
			} else {
				console.error("Error logging food");
			}
		} catch (error) {
			console.error("Error logging food:", error);
		} finally {
			setIsLogging(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Search Food</Label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search for a food..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<ScrollArea className="h-48 border rounded-lg">
				<div className="p-2 space-y-1">
					{isLoading || isLoadingRecent ? (
						<div className="text-center text-muted-foreground py-4">
							{isLoading ? "Searching..." : "Loading recent foods..."}
						</div>
					) : searchQuery.length > 2 ? (
						// Show search results
						foods.length > 0 ? (
							foods.map((food) => (
								<div
									key={food.id}
									className={`p-3 rounded-lg hover:bg-muted transition-colors ${
										selectedFood?.id === food.id
											? "bg-primary/10 border border-primary"
											: ""
									}`}
								>
									<div className="flex items-center justify-between">
										<button
											onClick={() => setSelectedFood(food)}
											className="flex-1 text-left"
										>
											<div className="flex items-center gap-2">
												<div className="font-medium">{food.name}</div>
												{food.isVerified && (
													<CheckCircle className="w-4 h-4 text-green-600" />
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												{food.calories} cal • P: {food.protein}g • C:{" "}
												{food.carbs}g • F: {food.fat}g
												{food.source === "usda" && (
													<span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
														USDA
													</span>
												)}
											</div>
										</button>
										{food.source === "usda" && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleSaveFood(food)}
												className="ml-2 p-1 h-8 w-8"
											>
												<Star
													className={`w-4 h-4 ${
														savedFoodIds.has(food.id)
															? "fill-yellow-500 text-yellow-500"
															: "text-yellow-500"
													}`}
												/>
											</Button>
										)}
									</div>
								</div>
							))
						) : (
							<div className="text-center text-muted-foreground py-4">
								No foods found
							</div>
						)
					) : (
						// Show recent foods section
						<>
							<div className="text-sm font-medium text-muted-foreground mb-2">
								Recent Foods
							</div>
							{recentFoods.length > 0 ? (
								recentFoods.map((food) => (
									<button
										key={food.id}
										onClick={() => setSelectedFood(food)}
										className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${
											selectedFood?.id === food.id
												? "bg-primary/10 border border-primary"
												: ""
										}`}
									>
										<div className="flex items-center gap-2">
											<div className="font-medium">{food.name}</div>
											{food.isVerified && (
												<CheckCircle className="w-4 h-4 text-green-600" />
											)}
										</div>
										<div className="text-sm text-muted-foreground">
											{food.calories} cal • P: {food.protein}g • C: {food.carbs}g
											• F: {food.fat}g
											{food.source === "usda" && (
												<span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
													USDA
												</span>
											)}
										</div>
									</button>
								))
							) : (
								<div className="text-center text-muted-foreground py-4">
									No recent foods yet. Start typing to search for foods.
								</div>
							)}
						</>
					)}
				</div>
			</ScrollArea>

			{selectedFood && (
				<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Meal Type</Label>
							<Select
								value={mealType}
								onValueChange={(
									value: "breakfast" | "lunch" | "dinner" | "snacks",
								) => setMealType(value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="breakfast">Breakfast</SelectItem>
									<SelectItem value="lunch">Lunch</SelectItem>
									<SelectItem value="dinner">Dinner</SelectItem>
									<SelectItem value="snacks">Snacks</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Servings</Label>
							<Input
								type="number"
								step="0.1"
								min="0.1"
								value={servings}
								onChange={(e) => setServings(e.target.value)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-2 text-sm">
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.calories * Number.parseFloat(servings || "1"),
								)}
							</div>
							<div className="text-muted-foreground text-xs">Calories</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.protein * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Protein</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.carbs * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Carbs</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.fat * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Fat</div>
						</div>
					</div>

					<Button
						onClick={handleLogFood}
						className="w-full"
						disabled={isLogging}
					>
						{isLogging ? "Logging Food..." : "Log Food"}
					</Button>
				</div>
			)}
		</div>
	);
}

function CreateFoodTab(_: { onClose: () => void }) {
	const [name, setName] = useState("");
	const [calories, setCalories] = useState("");
	const [protein, setProtein] = useState("");
	const [carbs, setCarbs] = useState("");
	const [fat, setFat] = useState("");
	const [fiber, setFiber] = useState("");
	const [sugar, setSugar] = useState("");
	const [sodium, setSodium] = useState("");
	const [servingSize, setServingSize] = useState("");
	const [servingUnit, setServingUnit] = useState("g");
	const [category, setCategory] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const addFood = useStore((state) => state.addFood);

	const handleCreateFood = async () => {
		if (!calories || Number(calories) <= 0) return;

		try {
			const response = await fetch("/api/foods", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name || "Unnamed Food",
					calories: Number(calories) || 0,
					protein: Number(protein) || 0,
					carbs: Number(carbs) || 0,
					fat: Number(fat) || 0,
					fiber: fiber ? Number(fiber) : undefined,
					sugar: sugar ? Number(sugar) : undefined,
					sodium: sodium ? Number(sodium) : undefined,
					servingSize: servingSize || "1",
					servingUnit,
					isPublic,
					category: category || undefined,
				}),
			});

			if (response.ok) {
				const newFood = await response.json();
				addFood(newFood);
				toast.success("Food created successfully!");
			} else {
				const errorText = await response.text();
				console.error("Error creating food:", {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
				});
				alert(`Error creating food: ${errorText}`);
			}
		} catch (error) {
			console.error("Error creating food:", error);
		}
	};

	return (
		<ScrollArea className="h-[400px] pr-4">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Food Name</Label>
					<Input
						placeholder="e.g., Homemade Protein Shake"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Serving Size</Label>
						<Input
							type="number"
							placeholder="100"
							value={servingSize}
							onChange={(e) => setServingSize(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Unit</Label>
						<Select value={servingUnit} onValueChange={setServingUnit}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="g">grams (g)</SelectItem>
								<SelectItem value="oz">ounces (oz)</SelectItem>
								<SelectItem value="ml">milliliters (ml)</SelectItem>
								<SelectItem value="cup">cup</SelectItem>
								<SelectItem value="tbsp">tablespoon</SelectItem>
								<SelectItem value="tsp">teaspoon</SelectItem>
								<SelectItem value="piece">piece</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>
							Calories <span className="text-red-500">*</span>
						</Label>
						<Input
							type="number"
							placeholder="0"
							value={calories}
							onChange={(e) => setCalories(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Protein (g)</Label>
						<Input
							type="number"
							placeholder="0"
							value={protein}
							onChange={(e) => setProtein(e.target.value)}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Carbs (g)</Label>
						<Input
							type="number"
							placeholder="0"
							value={carbs}
							onChange={(e) => setCarbs(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Fat (g)</Label>
						<Input
							type="number"
							placeholder="0"
							value={fat}
							onChange={(e) => setFat(e.target.value)}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Fiber (g)</Label>
						<Input
							type="number"
							placeholder="0"
							value={fiber}
							onChange={(e) => setFiber(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Sugar (g)</Label>
						<Input
							type="number"
							placeholder="0"
							value={sugar}
							onChange={(e) => setSugar(e.target.value)}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Sodium (mg)</Label>
						<Input
							type="number"
							placeholder="0"
							value={sodium}
							onChange={(e) => setSodium(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Category</Label>
						<Input
							placeholder="e.g., Fruits, Vegetables"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
					<div className="space-y-0.5">
						<Label htmlFor="food-public">Make this food public</Label>
						<p className="text-sm text-muted-foreground">
							Allow other users to find and use this food
						</p>
					</div>
					<Switch
						id="food-public"
						checked={isPublic}
						onCheckedChange={setIsPublic}
					/>
				</div>

				<Button onClick={handleCreateFood} className="w-full">
					<Plus className="w-4 h-4 mr-2" />
					Create Food
				</Button>
				<p className="text-xs text-muted-foreground text-center">
					<span className="text-red-500">*</span> Required fields
				</p>
			</div>
		</ScrollArea>
	);
}

function CreateMealTab(_: { onClose: () => void }) {
	const [mealName, setMealName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFoods, setSelectedFoods] = useState<
		{ food: Food; servings: number }[]
	>([]);
	const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isPublic, setIsPublic] = useState(true);
	const addMeal = useStore((state) => state.addMeal);

	const searchFoods = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/foods?q=${encodeURIComponent(searchQuery)}`,
			);
			if (response.ok) {
				const data = await response.json();
				setAvailableFoods(data);
			}
		} catch (error) {
			console.error("Error searching foods:", error);
		} finally {
			setIsLoading(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		if (searchQuery.length > 2) {
			searchFoods();
		} else {
			setAvailableFoods([]);
		}
	}, [searchQuery, searchFoods]);

	const handleAddFoodToMeal = (food: Food) => {
		if (selectedFoods.find((f) => f.food.id === food.id)) return;
		setSelectedFoods([...selectedFoods, { food, servings: 1 }]);
	};

	const handleUpdateServings = (foodId: string, servings: number) => {
		setSelectedFoods(
			selectedFoods.map((f) => (f.food.id === foodId ? { ...f, servings } : f)),
		);
	};

	const handleRemoveFood = (foodId: string) => {
		setSelectedFoods(selectedFoods.filter((f) => f.food.id !== foodId));
	};

	const calculateTotals = () => {
		return selectedFoods.reduce(
			(acc, { food, servings }) => ({
				calories: acc.calories + food.calories * servings,
				protein: acc.protein + food.protein * servings,
				carbs: acc.carbs + food.carbs * servings,
				fat: acc.fat + food.fat * servings,
			}),
			{ calories: 0, protein: 0, carbs: 0, fat: 0 },
		);
	};

	const handleCreateMeal = async () => {
		if (selectedFoods.length === 0) return;

		const totals = calculateTotals();
		try {
			const response = await fetch("/api/meals", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: mealName || "Custom Meal",
					foods: selectedFoods.map((f) => ({
						foodId: f.food.id,
						servings: f.servings,
					})),
					totalCalories: Math.round(totals.calories),
					totalProtein: Math.round(totals.protein),
					totalCarbs: Math.round(totals.carbs),
					totalFat: Math.round(totals.fat),
					isPublic,
				}),
			});

			if (response.ok) {
				const newMeal = await response.json();
				addMeal(newMeal);
				toast.success("Meal created successfully!");
			} else {
				const errorText = await response.text();
				console.error("Error creating meal:", {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
				});
				alert(`Error creating meal: ${errorText}`);
			}
		} catch (error) {
			console.error("Error creating meal:", error);
		}
	};

	const totals = calculateTotals();

	return (
		<ScrollArea className="h-[400px] pr-4">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Meal Name</Label>
					<Input
						placeholder="e.g., Post-Workout Meal"
						value={mealName}
						onChange={(e) => setMealName(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label>
						Add Foods <span className="text-red-500">*</span>
					</Label>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search for foods..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>

				{searchQuery && (
					<div className="border rounded-lg max-h-32 overflow-y-auto">
						<div className="p-2 space-y-1">
							{isLoading ? (
								<div className="text-center text-muted-foreground py-4">
									Searching...
								</div>
							) : (
								availableFoods.slice(0, 5).map((food) => (
									<button
										key={food.id}
										onClick={() => handleAddFoodToMeal(food)}
										disabled={selectedFoods.some((f) => f.food.id === food.id)}
										className="w-full text-left p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<div className="flex items-center gap-2">
											<div className="font-medium text-sm">{food.name}</div>
											{food.isVerified && (
												<CheckCircle className="w-3 h-3 text-green-600" />
											)}
										</div>
										<div className="text-xs text-muted-foreground">
											{food.calories} cal
											{food.source === "usda" && (
												<span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
													USDA
												</span>
											)}
										</div>
									</button>
								))
							)}
						</div>
					</div>
				)}

				{selectedFoods.length > 0 && (
					<div className="space-y-2">
						<Label>Selected Foods</Label>
						<div className="space-y-2">
							{selectedFoods.map(({ food, servings }) => (
								<div
									key={food.id}
									className="flex items-center gap-2 p-2 border rounded-lg"
								>
									<div className="flex-1">
										<div className="font-medium text-sm">{food.name}</div>
										<div className="text-xs text-muted-foreground">
											{Math.round(food.calories * servings)} cal • P:{" "}
											{Math.round(food.protein * servings)}g
										</div>
									</div>
									<Input
										type="number"
										step="0.1"
										min="0.1"
										value={servings}
										onChange={(e) =>
											handleUpdateServings(
												food.id,
												Number.parseFloat(e.target.value) || 1,
											)
										}
										className="w-20"
									/>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveFood(food.id)}
									>
										Remove
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{selectedFoods.length > 0 && (
					<div className="p-4 border rounded-lg bg-muted/30 space-y-3">
						<div className="font-semibold">Meal Totals</div>
						<div className="grid grid-cols-4 gap-2 text-sm">
							<div className="text-center p-2 bg-background rounded">
								<div className="font-semibold">
									{Math.round(totals.calories)}
								</div>
								<div className="text-muted-foreground text-xs">Calories</div>
							</div>
							<div className="text-center p-2 bg-background rounded">
								<div className="font-semibold">
									{Math.round(totals.protein)}g
								</div>
								<div className="text-muted-foreground text-xs">Protein</div>
							</div>
							<div className="text-center p-2 bg-background rounded">
								<div className="font-semibold">{Math.round(totals.carbs)}g</div>
								<div className="text-muted-foreground text-xs">Carbs</div>
							</div>
							<div className="text-center p-2 bg-background rounded">
								<div className="font-semibold">{Math.round(totals.fat)}g</div>
								<div className="text-muted-foreground text-xs">Fat</div>
							</div>
						</div>

						<div className="flex items-center justify-between p-3 border rounded-lg bg-background">
							<div className="space-y-0.5">
								<Label htmlFor="meal-public" className="text-sm">
									Make this meal public
								</Label>
								<p className="text-xs text-muted-foreground">
									Allow other users to find and use this meal
								</p>
							</div>
							<Switch
								id="meal-public"
								checked={isPublic}
								onCheckedChange={setIsPublic}
							/>
						</div>

						<Button onClick={handleCreateMeal} className="w-full">
							<Utensils className="w-4 h-4 mr-2" />
							Create Meal
						</Button>
					</div>
				)}
				<p className="text-xs text-muted-foreground text-center">
					<span className="text-red-500">*</span> Required fields
				</p>
			</div>
		</ScrollArea>
	);
}

function RecentFoodsTab({
	onClose,
	selectedDate,
}: {
	onClose: () => void;
	selectedDate?: Date;
}) {
	const [recentFoods, setRecentFoods] = useState<Food[]>([]);
	const [selectedFood, setSelectedFood] = useState<Food | null>(null);
	const [servings, setServings] = useState("1");
	const [mealType, setMealType] = useState<
		"breakfast" | "lunch" | "dinner" | "snacks"
	>("breakfast");
	const [isLoading, setIsLoading] = useState(false);
	const [isLogging, setIsLogging] = useState(false);
	const addMealEntry = useStore((state) => state.addMealEntry);

	useEffect(() => {
		const loadRecentFoods = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/foods?limit=12");
				if (response.ok) {
					const data: Food[] = await response.json();
					setRecentFoods(data);
				}
			} catch (error) {
				console.error("Error loading recent foods:", error);
			} finally {
				setIsLoading(false);
			}
		};

		void loadRecentFoods();
	}, []);

	const handleLogFood = async () => {
		if (!selectedFood) return;

		setIsLogging(true);
		const servingAmount = Number.parseFloat(servings) || 1;
		const entry: MealEntry = {
			id: Date.now().toString(),
			date: selectedDate
				? selectedDate.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			mealType,
			foodId: selectedFood.id,
			servings: servingAmount,
			calories: selectedFood.calories * servingAmount,
			protein: selectedFood.protein * servingAmount,
			carbs: selectedFood.carbs * servingAmount,
			fat: selectedFood.fat * servingAmount,
		};

		try {
			const response = await fetch("/api/meal-entries", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(entry),
			});

			if (response.ok) {
				const createdEntry = await response.json();
				addMealEntry(createdEntry);
				onClose();
			} else {
				console.error("Error logging recent food");
			}
		} catch (error) {
			console.error("Error logging recent food:", error);
		} finally {
			setIsLogging(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground">
				Your most recently saved or created foods
			</div>
			<ScrollArea className="h-48 border rounded-lg">
				<div className="p-2 space-y-1">
					{isLoading ? (
						<div className="text-center text-muted-foreground py-4">
							Loading recent foods...
						</div>
					) : recentFoods.length > 0 ? (
						recentFoods.map((food) => (
							<div
								key={food.id}
								className={`p-3 rounded-lg hover:bg-muted transition-colors ${
									selectedFood?.id === food.id
										? "bg-primary/10 border border-primary"
										: ""
								}`}
							>
								<button
									onClick={() => setSelectedFood(food)}
									className="flex flex-col gap-1 text-left w-full"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-medium">{food.name}</span>
											{food.isVerified && (
												<CheckCircle className="w-4 h-4 text-green-600" />
											)}
										</div>
										{food.source === "usda" && (
											<span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
												USDA
											</span>
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										{food.calories} cal • P: {food.protein}g • C: {food.carbs}g
										• F: {food.fat}g
									</div>
								</button>
							</div>
						))
					) : (
						<div className="text-center text-muted-foreground py-4">
							No recent foods tracked yet.
						</div>
					)}
				</div>
			</ScrollArea>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label>Servings</Label>
					<Input
						type="number"
						min="0.01"
						step="0.1"
						value={servings}
						onChange={(e) => setServings(e.target.value)}
						placeholder="1"
						disabled={!selectedFood}
					/>
				</div>
				<div className="space-y-2">
					<Label>Meal Type</Label>
					<Select
						value={mealType}
						onValueChange={(value: string) =>
							setMealType(value as "breakfast" | "lunch" | "dinner" | "snacks")
						}
						disabled={!selectedFood}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="breakfast">Breakfast</SelectItem>
							<SelectItem value="lunch">Lunch</SelectItem>
							<SelectItem value="dinner">Dinner</SelectItem>
							<SelectItem value="snacks">Snacks</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{selectedFood && (
				<div className="grid grid-cols-4 gap-2 text-sm">
					<div className="text-center p-2 bg-background rounded">
						<div className="font-semibold">
							{Math.round(
								selectedFood.calories * Number.parseFloat(servings || "1"),
							)}
						</div>
						<div className="text-muted-foreground text-xs">Calories</div>
					</div>
					<div className="text-center p-2 bg-background rounded">
						<div className="font-semibold">
							{Math.round(
								selectedFood.protein * Number.parseFloat(servings || "1"),
							)}
							g
						</div>
						<div className="text-muted-foreground text-xs">Protein</div>
					</div>
					<div className="text-center p-2 bg-background rounded">
						<div className="font-semibold">
							{Math.round(
								selectedFood.carbs * Number.parseFloat(servings || "1"),
							)}
							g
						</div>
						<div className="text-muted-foreground text-xs">Carbs</div>
					</div>
					<div className="text-center p-2 bg-background rounded">
						<div className="font-semibold">
							{Math.round(
								selectedFood.fat * Number.parseFloat(servings || "1"),
							)}
							g
						</div>
						<div className="text-muted-foreground text-xs">Fat</div>
					</div>
				</div>
			)}

			<Button
				className="w-full"
				size="lg"
				onClick={handleLogFood}
				disabled={!selectedFood || isLogging}
			>
				{isLogging ? "Logging..." : "Log Selected Food"}
			</Button>
		</div>
	);
}

function MyFoodsTab({
	onClose,
	selectedDate,
	variant = "my",
}: {
	onClose: () => void;
	selectedDate?: Date;
	variant?: "my" | "saved";
}) {
	const [selectedFood, setSelectedFood] = useState<Food | null>(null);
	const [servings, setServings] = useState("1");
	const [mealType, setMealType] = useState<
		"breakfast" | "lunch" | "dinner" | "snacks"
	>("breakfast");
	const [isLogging, setIsLogging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [editingFood, setEditingFood] = useState<Food | null>(null);
	const [editName, setEditName] = useState("");
	const [editCalories, setEditCalories] = useState("");
	const [editProtein, setEditProtein] = useState("");
	const [editCarbs, setEditCarbs] = useState("");
	const [editFat, setEditFat] = useState("");
	const [editFiber, setEditFiber] = useState("");
	const [editSugar, setEditSugar] = useState("");
	const [editSodium, setEditSodium] = useState("");
	const [editServingSize, setEditServingSize] = useState("");
	const [editServingUnit, setEditServingUnit] = useState("g");
	const [editCategory, setEditCategory] = useState("");
	const [editIsPublic, setEditIsPublic] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const addMealEntry = useStore((state) => state.addMealEntry);
	const { foods, setFoods } = useStore((state) => state);
	const isSavedVariant = variant === "saved";
	const filteredFoods = useMemo(
		() =>
			foods.filter((food) => food.source === "user" && (isSavedVariant ? !food.isPublic : food.isPublic)),
		[foods, isSavedVariant],
	);
	const description = isSavedVariant
		? "Select from foods you've saved"
		: "Select from foods you've created";
	const emptyState = isSavedVariant
		? "No saved foods yet. Save foods to keep them handy!"
		: "No custom foods yet. Create some foods first!";

	useEffect(() => {
		if (!selectedFood) return;
		const stillExists = filteredFoods.some(
			(food) => food.id === selectedFood.id,
		);
		if (!stillExists) {
			setSelectedFood(null);
		}
	}, [filteredFoods, selectedFood]);

	const handleStartEdit = (food: Food) => {
		setEditingFood(food);
		setEditName(food.name);
		setEditCalories(food.calories.toString());
		setEditProtein(food.protein.toString());
		setEditCarbs(food.carbs.toString());
		setEditFat(food.fat.toString());
		setEditFiber(food.fiber?.toString() || "");
		setEditSugar(food.sugar?.toString() || "");
		setEditSodium(food.sodium?.toString() || "");
		setEditServingSize(food.servingSize);
		setEditServingUnit(food.servingUnit);
		setEditCategory(food.category || "");
		setEditIsPublic(food.isPublic);
	};

	const handleEditFood = async () => {
		if (!editingFood) return;

		setIsEditing(true);
		try {
			const response = await fetch("/api/foods", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: editingFood.id,
					name: editName,
					calories: editCalories,
					protein: editProtein,
					carbs: editCarbs,
					fat: editFat,
					fiber: editFiber ? editFiber : undefined,
					sugar: editSugar ? editSugar : undefined,
					sodium: editSodium ? editSodium : undefined,
					servingSize: editServingSize,
					servingUnit: editServingUnit,
					isPublic: editIsPublic,
					category: editCategory || undefined,
				}),
			});

			if (response.ok) {
				const updatedFood = await response.json();
				// Replace the old food with the new one in the store
				setFoods(foods.map((f) => (f.id === editingFood.id ? updatedFood : f)));
				setEditingFood(null);
				toast.success("Food updated successfully!");
			} else {
				const errorText = await response.text();
				console.error("Error updating food:", errorText);
				alert(`Error updating food: ${errorText}`);
			}
		} catch (error) {
			console.error("Error updating food:", error);
			toast.error("Error updating food");
		} finally {
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditingFood(null);
	};

	useEffect(() => {
		if (foods.length > 0) return;

		const loadUserFoods = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/foods?limit=100");
				if (response.ok) {
					const data: Food[] = await response.json();
					setFoods(data);
				}
			} catch (error) {
				console.error("Error loading user foods:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserFoods();
	}, [foods.length, setFoods]);

	const handleLogFood = async () => {
		if (!selectedFood) return;

		setIsLogging(true);
		const servingAmount = Number.parseFloat(servings) || 1;
		const entry: MealEntry = {
			id: Date.now().toString(),
			date: selectedDate
				? selectedDate.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			mealType,
			foodId: selectedFood.id,
			servings: servingAmount,
			calories: selectedFood.calories * servingAmount,
			protein: selectedFood.protein * servingAmount,
			carbs: selectedFood.carbs * servingAmount,
			fat: selectedFood.fat * servingAmount,
		};

		try {
			const response = await fetch("/api/meal-entries", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(entry),
			});

			if (response.ok) {
				const createdEntry = await response.json();
				addMealEntry(createdEntry);
				onClose();
			} else {
				console.error("Error logging food");
			}
		} catch (error) {
			console.error("Error logging food:", error);
		} finally {
			setIsLogging(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground">{description}</div>

			<ScrollArea className="h-48 border rounded-lg">
				<div className="p-2 space-y-1">
					{isLoading ? (
						<div className="text-center text-muted-foreground py-4">
							Loading your foods...
						</div>
					) : filteredFoods.length > 0 ? (
						filteredFoods.map((food) => (
							<div
								key={food.id}
								className={`p-3 rounded-lg hover:bg-muted transition-colors ${
									selectedFood?.id === food.id
										? "bg-primary/10 border border-primary"
										: ""
								}`}
							>
								<div className="flex items-center justify-between">
									<button
										onClick={() => setSelectedFood(food)}
										className="flex-1 text-left"
									>
										<div className="flex items-center gap-2">
											<div className="font-medium">{food.name}</div>
											{food.isVerified && (
												<CheckCircle className="w-4 h-4 text-green-600" />
											)}
										</div>
										<div className="text-sm text-muted-foreground">
											{food.calories} cal • P: {food.protein}g • C: {food.carbs}
											g • F: {food.fat}g
											{food.source === "usda" && (
												<span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
													USDA
												</span>
											)}
										</div>
									</button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleStartEdit(food)}
										className="ml-2"
										disabled={food.source !== "user"}
									>
										<Edit className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))
					) : (
						<div className="text-center text-muted-foreground py-4">
							{emptyState}
						</div>
					)}
				</div>
			</ScrollArea>

			{editingFood && (
				<div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Edit className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
								Edit Food
							</h3>
						</div>
						<Button variant="ghost" size="sm" onClick={handleCancelEdit}>
							Cancel
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Food Name</Label>
							<Input
								placeholder="e.g., Homemade Protein Shake"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Category</Label>
							<Input
								placeholder="e.g., Fruits, Vegetables"
								value={editCategory}
								onChange={(e) => setEditCategory(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Serving Size</Label>
							<Input
								type="number"
								placeholder="100"
								value={editServingSize}
								onChange={(e) => setEditServingSize(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Unit</Label>
							<Select
								value={editServingUnit}
								onValueChange={setEditServingUnit}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="g">grams (g)</SelectItem>
									<SelectItem value="oz">ounces (oz)</SelectItem>
									<SelectItem value="ml">milliliters (ml)</SelectItem>
									<SelectItem value="cup">cup</SelectItem>
									<SelectItem value="tbsp">tablespoon</SelectItem>
									<SelectItem value="tsp">teaspoon</SelectItem>
									<SelectItem value="piece">piece</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-3">
						<h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
							Nutrition Facts (per serving)
						</h4>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<Flame className="w-4 h-4 text-orange-500" />
									Calories <span className="text-red-500">*</span>
								</Label>
								<Input
									type="number"
									placeholder="0"
									value={editCalories}
									onChange={(e) => setEditCalories(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Protein (g)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editProtein}
									onChange={(e) => setEditProtein(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Carbs (g)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editCarbs}
									onChange={(e) => setEditCarbs(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Fat (g)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editFat}
									onChange={(e) => setEditFat(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Fiber (g)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editFiber}
									onChange={(e) => setEditFiber(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Sugar (g)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editSugar}
									onChange={(e) => setEditSugar(e.target.value)}
								/>
							</div>
							<div className="space-y-2 col-span-2">
								<Label>Sodium (mg)</Label>
								<Input
									type="number"
									placeholder="0"
									value={editSodium}
									onChange={(e) => setEditSodium(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-3 border rounded-lg bg-background">
						<div className="space-y-0.5">
							<Label htmlFor="edit-food-public" className="text-sm font-medium">
								Make this food public
							</Label>
							<p className="text-xs text-muted-foreground">
								Allow other users to find and use this food
							</p>
						</div>
						<Switch
							id="edit-food-public"
							checked={editIsPublic}
							onCheckedChange={setEditIsPublic}
						/>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={handleEditFood}
							className="flex-1"
							disabled={isEditing}
						>
							<Edit className="w-4 h-4 mr-2" />
							{isEditing ? "Updating..." : "Update Food"}
						</Button>
					</div>
					<p className="text-xs text-muted-foreground text-center">
						<span className="text-red-500">*</span> Required fields
					</p>
				</div>
			)}

			{selectedFood && (
				<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Meal Type</Label>
							<Select
								value={mealType}
								onValueChange={(
									value: "breakfast" | "lunch" | "dinner" | "snacks",
								) => setMealType(value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="breakfast">Breakfast</SelectItem>
									<SelectItem value="lunch">Lunch</SelectItem>
									<SelectItem value="dinner">Dinner</SelectItem>
									<SelectItem value="snacks">Snacks</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Servings</Label>
							<Input
								type="number"
								step="0.1"
								min="0.1"
								value={servings}
								onChange={(e) => setServings(e.target.value)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-2 text-sm">
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.calories * Number.parseFloat(servings || "1"),
								)}
							</div>
							<div className="text-muted-foreground text-xs">Calories</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.protein * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Protein</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.carbs * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Carbs</div>
						</div>
						<div className="text-center p-2 bg-background rounded">
							<div className="font-semibold">
								{Math.round(
									selectedFood.fat * Number.parseFloat(servings || "1"),
								)}
								g
							</div>
							<div className="text-muted-foreground text-xs">Fat</div>
						</div>
					</div>

					<Button
						onClick={handleLogFood}
						className="w-full"
						disabled={isLogging}
					>
						{isLogging ? "Logging Food..." : "Log Food"}
					</Button>
				</div>
			)}
		</div>
	);
}
