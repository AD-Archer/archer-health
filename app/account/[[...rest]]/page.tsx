"use client";

import { UserProfile } from "@clerk/nextjs";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";

export default function AccountManagementPage() {
	return (
		<>
			<DesktopNav />
			<MobileNav />
			<main className="min-h-screen bg-background pt-16 md:pt-0">
				<div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col items-center">
					<h1 className="font-display text-3xl font-bold mb-8 text-center w-full">
						Account Management
					</h1>
					<p className="text-sm text-muted-foreground mb-6 text-center">
						Accounts securely managed by Clerk
					</p>
					<div className="">
						<UserProfile
							appearance={{
								elements: {
									rootBox: "w-full",
									card: "w-full shadow-none border-none",
								},
							}}
						/>
					</div>
				</div>
			</main>
		</>
	);
}
