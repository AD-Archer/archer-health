"use client";

import {
	BookOpen,
	Home,
	Plus,
	Target,
	TrendingUp,
	User,
	UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AddEntryModal } from "@/components/add-entry-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopNav() {
	const pathname = usePathname();
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	const navItems = [
		{ href: "/dashboard", icon: Home, label: "Dashboard" },
		{ href: "/goals", icon: Target, label: "Goals" },
		{ href: "/meal-log", icon: UtensilsCrossed, label: "Log" },
		{ href: "/recipes", icon: BookOpen, label: "Recipes" },
		{ href: "/progress", icon: TrendingUp, label: "Progress" },
		{ href: "/profile", icon: User, label: "Profile" },
	];

	return (
		<>
			<header className="hidden md:block sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto max-w-7xl px-4">
					<div className="flex h-16 items-center justify-center gap-8">
						<Link href="/dashboard" className="flex items-center gap-2">
							<div className="w-12 h-12 rounded-4xl bg-white flex items-center justify-center">
								<Image
									src="/archerhealthlogo.png"
									alt="Archer Health Logo"
									width={40}
									height={40}
									className="w-10 h-10 object-contain rounded-4xl"
								/>
							</div>
							<span className="text-xl font-bold font-display">
								Archer Health
							</span>
						</Link>

						<nav className="flex items-center gap-1">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
										pathname === item.href
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:text-foreground hover:bg-muted",
									)}
								>
									<item.icon className="w-4 h-4" />
									{item.label}
								</Link>
							))}
						</nav>

						<Button onClick={() => setIsAddModalOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Add Entry
						</Button>
					</div>
				</div>
			</header>

			<AddEntryModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
		</>
	);
}
