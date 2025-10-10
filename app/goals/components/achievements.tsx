"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Achievements() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-display">Achievements</CardTitle>
			</CardHeader>
			<CardContent>
				<Button className="w-full bg-transparent" variant="outline">
					<Plus className="w-4 h-4 mr-2" />
					Add New Goal
				</Button>
			</CardContent>
		</Card>
	);
}
