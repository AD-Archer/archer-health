import { Suspense } from "react";
import { RecipesContainer } from "./recipes-container";

export function Recipes() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RecipesContainer />
		</Suspense>
	);
}
