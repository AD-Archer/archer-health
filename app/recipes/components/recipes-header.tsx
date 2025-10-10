"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function RecipesHeader() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold font-display">Recipes</h1>
				<p className="text-muted-foreground">Discover healthy meal ideas</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input placeholder="Search recipes..." className="pl-10" />
			</div>
		</div>
	);
}
