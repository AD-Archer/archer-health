import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { AddOptions } from "./components/add-options";

export default function AddPage() {
	return (
		<div className="min-h-screen bg-muted/30">
			<DesktopNav />

			<main className="container py-6 pb-24 md:pb-6">
				<div className="max-w-2xl mx-auto space-y-6">
					<div>
						<h1 className="text-3xl font-bold font-display">Add Entry</h1>
						<p className="text-muted-foreground">What would you like to log?</p>
					</div>
					<AddOptions />
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
