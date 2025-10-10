"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { Bell, Edit, HelpCircle, Lock, Settings } from "lucide-react";
import { useState } from "react";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { HelpModal } from "@/components/help-modal";
import { NotificationsModal } from "@/components/notifications-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function ProfileHeader() {
	const { user, isLoaded } = useUser();
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [isHelpOpen, setIsHelpOpen] = useState(false);
	const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
	// Removed modal state for account management

	if (!isLoaded) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="w-20 h-20 bg-muted rounded-full animate-pulse"></div>
						<div className="flex-1 space-y-2">
							<div className="h-6 bg-muted rounded animate-pulse"></div>
							<div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!user) {
		return null;
	}

	const displayName =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.username || user.primaryEmailAddress?.emailAddress || "User";

	const initials =
		user.firstName && user.lastName
			? `${user.firstName[0]}${user.lastName[0]}`
			: user.username?.[0]?.toUpperCase() ||
				user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
				"U";

	return (
		<>
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<Avatar className="w-16 h-16 sm:w-20 sm:h-20">
							<AvatarImage src={user.imageUrl} />
							<AvatarFallback className="bg-primary text-white text-lg sm:text-2xl font-display">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h2 className="text-xl sm:text-2xl font-bold font-display">
								{displayName}
							</h2>
							<p className="text-muted-foreground text-sm sm:text-base">
								{user.primaryEmailAddress?.emailAddress}
							</p>
							{user.username && (
								<p className="text-xs sm:text-sm text-muted-foreground">
									@{user.username}
								</p>
							)}
							<div className="flex flex-col sm:flex-row gap-2 mt-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => setIsEditProfileOpen(true)}
									className="w-full sm:w-auto"
								>
									<Edit className="w-4 h-4 mr-2" />
									Edit Goals & Info
								</Button>
								{/* <Button size="sm">Upgrade to Premium</Button> */}
								<Button
									size="sm"
									variant="outline"
									asChild
									className="w-full sm:w-auto"
								>
									<a href="/account" className="flex items-center">
										<Lock className="w-4 h-4 mr-2" />
										Manage Account
									</a>
								</Button>
							</div>
						</div>
						<div className="flex gap-2 self-end sm:self-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsNotificationsOpen(true)}
							>
								<Bell className="w-5 h-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsHelpOpen(true)}
							>
								<HelpCircle className="w-5 h-5" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<NotificationsModal
				open={isNotificationsOpen}
				onOpenChange={setIsNotificationsOpen}
			/>
			<HelpModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />
			<EditProfileModal
				open={isEditProfileOpen}
				onOpenChange={setIsEditProfileOpen}
			/>
			{/* Removed Clerk UserProfile Modal. Use /account page for account management. */}
		</>
	);
}
