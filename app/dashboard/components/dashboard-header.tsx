"use client";

import { format } from "date-fns";

export function DashboardHeader() {
	const today = format(new Date(), "EEEE, MMM d, yyyy");

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold font-display">Dashboard</h1>
				<p className="text-muted-foreground">{today}</p>
			</div>
		</div>
	);
}
