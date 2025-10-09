"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Flame, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const recipes = [
  {
    id: "1",
    name: "Grilled Salmon with Asparagus",
    image: "/grilled-salmon-asparagus.jpg",
    calories: 420,
    prepTime: 15,
    category: "Dinner",
  },
  {
    id: "2",
    name: "Lemon Herb Chicken Salad",
    image: "/lemon-herb-chicken-salad.jpg",
    calories: 320,
    prepTime: 15,
    category: "Lunch",
  },
  {
    id: "3",
    name: "Mediterranean Quinoa Bowl",
    image: "/mediterranean-quinoa-bowl.png",
    calories: 380,
    prepTime: 15,
    category: "Lunch",
  },
  {
    id: "4",
    name: "Veggie Stir Fry",
    image: "/vegetable-stir-fry.png",
    calories: 280,
    prepTime: 20,
    category: "Dinner",
  },
]

export function RecipeGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={recipe.image || "/placeholder.svg"}
              alt={recipe.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Button size="icon" className="absolute top-3 right-3 rounded-full shadow-lg" variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <Badge variant="secondary" className="mb-2">
                {recipe.category}
              </Badge>
              <h3 className="font-semibold font-display">{recipe.name}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4" />
                <span>{recipe.calories} kcal</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.prepTime} min prep</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
