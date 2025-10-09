"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Utensils } from "lucide-react"
import { useStore } from "@/lib/store"
import type { Food, MealEntry } from "@/app/data/data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"

interface AddEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEntryModal({ open, onOpenChange }: AddEntryModalProps) {
  const [activeTab, setActiveTab] = useState("log-food")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Entry</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log-food">Log Food</TabsTrigger>
            <TabsTrigger value="create-food">Create Food</TabsTrigger>
            <TabsTrigger value="create-meal">Create Meal</TabsTrigger>
          </TabsList>

          <TabsContent value="log-food" className="space-y-4">
            <LogFoodTab onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="create-food" className="space-y-4">
            <CreateFoodTab onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="create-meal" className="space-y-4">
            <CreateMealTab onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function LogFoodTab({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [servings, setServings] = useState("1")
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snacks">("breakfast")
  const addMealEntry = useStore((state) => state.addMealEntry)
  const foods = useStore((state) => state.foods)

  const filteredFoods = foods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleLogFood = () => {
    if (!selectedFood) return

    const servingAmount = Number.parseFloat(servings) || 1
    const entry: MealEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mealType,
      foodId: selectedFood.id,
      servings: servingAmount,
      calories: selectedFood.calories * servingAmount,
      protein: selectedFood.protein * servingAmount,
      carbs: selectedFood.carbs * servingAmount,
      fat: selectedFood.fat * servingAmount,
    }

    addMealEntry(entry)
    onClose()
  }

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
          {filteredFoods.map((food) => (
            <button
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${
                selectedFood?.id === food.id ? "bg-primary/10 border border-primary" : ""
              }`}
            >
              <div className="font-medium">{food.name}</div>
              <div className="text-sm text-muted-foreground">
                {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {selectedFood && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
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
                {Math.round(selectedFood.calories * Number.parseFloat(servings || "1"))}
              </div>
              <div className="text-muted-foreground text-xs">Calories</div>
            </div>
            <div className="text-center p-2 bg-background rounded">
              <div className="font-semibold">
                {Math.round(selectedFood.protein * Number.parseFloat(servings || "1"))}g
              </div>
              <div className="text-muted-foreground text-xs">Protein</div>
            </div>
            <div className="text-center p-2 bg-background rounded">
              <div className="font-semibold">
                {Math.round(selectedFood.carbs * Number.parseFloat(servings || "1"))}g
              </div>
              <div className="text-muted-foreground text-xs">Carbs</div>
            </div>
            <div className="text-center p-2 bg-background rounded">
              <div className="font-semibold">{Math.round(selectedFood.fat * Number.parseFloat(servings || "1"))}g</div>
              <div className="text-muted-foreground text-xs">Fat</div>
            </div>
          </div>

          <Button onClick={handleLogFood} className="w-full">
            Log Food
          </Button>
        </div>
      )}
    </div>
  )
}

function CreateFoodTab({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [servingSize, setServingSize] = useState("")
  const [servingUnit, setServingUnit] = useState("g")
  const [isPublic, setIsPublic] = useState(true)
  const addFood = useStore((state) => state.addFood)
  const user = useStore((state) => state.user)

  const handleCreateFood = () => {
    if (!name || !calories || !protein || !carbs || !fat || !servingSize) return

    const newFood: Food = {
      id: Date.now().toString(),
      name,
      calories: Number.parseFloat(calories),
      protein: Number.parseFloat(protein),
      carbs: Number.parseFloat(carbs),
      fat: Number.parseFloat(fat),
      servingSize,
      servingUnit,
      isPublic,
      createdBy: user.id,
      category: "Custom",
    }

    addFood(newFood)
    onClose()
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Food Name</Label>
          <Input placeholder="e.g., Homemade Protein Shake" value={name} onChange={(e) => setName(e.target.value)} />
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
            <Label>Calories</Label>
            <Input type="number" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Protein (g)</Label>
            <Input type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Carbs (g)</Label>
            <Input type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Fat (g)</Label>
            <Input type="number" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <Label htmlFor="food-public">Make this food public</Label>
            <p className="text-sm text-muted-foreground">Allow other users to find and use this food</p>
          </div>
          <Switch id="food-public" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <Button onClick={handleCreateFood} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create Food
        </Button>
      </div>
    </ScrollArea>
  )
}

function CreateMealTab({ onClose }: { onClose: () => void }) {
  const [mealName, setMealName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFoods, setSelectedFoods] = useState<{ food: Food; servings: number }[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const addMeal = useStore((state) => state.addMeal)
  const foods = useStore((state) => state.foods)
  const user = useStore((state) => state.user)

  const filteredFoods = foods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddFoodToMeal = (food: Food) => {
    if (selectedFoods.find((f) => f.food.id === food.id)) return
    setSelectedFoods([...selectedFoods, { food, servings: 1 }])
  }

  const handleUpdateServings = (foodId: string, servings: number) => {
    setSelectedFoods(selectedFoods.map((f) => (f.food.id === foodId ? { ...f, servings } : f)))
  }

  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.food.id !== foodId))
  }

  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, { food, servings }) => ({
        calories: acc.calories + food.calories * servings,
        protein: acc.protein + food.protein * servings,
        carbs: acc.carbs + food.carbs * servings,
        fat: acc.fat + food.fat * servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const handleCreateMeal = () => {
    if (!mealName || selectedFoods.length === 0) return

    const totals = calculateTotals()
    const newMeal = {
      id: Date.now().toString(),
      name: mealName,
      foods: selectedFoods.map((f) => ({ foodId: f.food.id, servings: f.servings })),
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbs: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
      isPublic,
      createdBy: user.id,
    }

    addMeal(newMeal)
    onClose()
  }

  const totals = calculateTotals()

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Meal Name</Label>
          <Input placeholder="e.g., Post-Workout Meal" value={mealName} onChange={(e) => setMealName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Add Foods</Label>
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
              {filteredFoods.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleAddFoodToMeal(food)}
                  disabled={selectedFoods.some((f) => f.food.id === food.id)}
                  className="w-full text-left p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-sm">{food.name}</div>
                  <div className="text-xs text-muted-foreground">{food.calories} cal</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedFoods.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Foods</Label>
            <div className="space-y-2">
              {selectedFoods.map(({ food, servings }) => (
                <div key={food.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{food.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(food.calories * servings)} cal • P: {Math.round(food.protein * servings)}g
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={servings}
                    onChange={(e) => handleUpdateServings(food.id, Number.parseFloat(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFood(food.id)}>
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
                <div className="font-semibold">{Math.round(totals.calories)}</div>
                <div className="text-muted-foreground text-xs">Calories</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold">{Math.round(totals.protein)}g</div>
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
                <p className="text-xs text-muted-foreground">Allow other users to find and use this meal</p>
              </div>
              <Switch id="meal-public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Button onClick={handleCreateMeal} className="w-full">
              <Utensils className="w-4 h-4 mr-2" />
              Create Meal
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
