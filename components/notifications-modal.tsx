"use client";

import { Bell, Check, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	time: string;
	read: boolean;
	createdAt: string;
}

interface NotificationsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface NotificationsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NotificationsModal({
	open,
	onOpenChange,
}: NotificationsModalProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchNotifications = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/notifications");
			if (!response.ok) {
				throw new Error("Failed to fetch notifications");
			}
			const data = await response.json();
			setNotifications(data.notifications || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load notifications",
			);
			console.error("Error fetching notifications:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const markAsRead = async (notificationId: string) => {
		try {
			const response = await fetch("/api/notifications", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					notificationId,
					action: "markAsRead",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to mark notification as read");
			}

			// Update local state
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.id === notificationId
						? { ...notification, read: true }
						: notification,
				),
			);

			toast.success("Notification marked as read");
		} catch (err) {
			console.error("Error marking notification as read:", err);
			toast.error("Failed to mark notification as read");
		}
	};

	const markAllAsRead = async () => {
		const unreadNotifications = notifications.filter((n) => !n.read);
		if (unreadNotifications.length === 0) {
			toast.info("All notifications are already read");
			return;
		}

		try {
			// Mark all unread notifications as read
			await Promise.all(
				unreadNotifications.map((notification) => markAsRead(notification.id)),
			);

			toast.success(
				`Marked ${unreadNotifications.length} notifications as read`,
			);
		} catch (err) {
			console.error("Error marking all notifications as read:", err);
			toast.error("Failed to mark notifications as read");
		}
	};

	useEffect(() => {
		if (open) {
			fetchNotifications();
		}
	}, [open]);

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "achievement":
				return CheckCircle2;
			case "reminder":
				return Bell;
			case "progress":
				return TrendingUp;
			case "info":
			default:
				return Info;
		}
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="font-display flex items-center justify-between">
						Notifications
						{unreadCount > 0 && (
							<span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
								{unreadCount}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				{unreadCount > 0 && (
					<div className="flex justify-end mb-2">
						<Button
							variant="outline"
							size="sm"
							onClick={markAllAsRead}
							className="text-xs"
						>
							<Check className="w-3 h-3 mr-1" />
							Mark all as read
						</Button>
					</div>
				)}

				<ScrollArea className="max-h-[400px] pr-4">
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className="p-4 rounded-lg border bg-muted/50 animate-pulse"
								>
									<div className="flex gap-3">
										<div className="w-10 h-10 rounded-full bg-muted"></div>
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-muted rounded w-3/4"></div>
											<div className="h-3 bg-muted rounded w-1/2"></div>
											<div className="h-3 bg-muted rounded w-1/4"></div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : error ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground mb-2">
								Failed to load notifications
							</p>
							<Button variant="outline" size="sm" onClick={fetchNotifications}>
								Try Again
							</Button>
						</div>
					) : notifications.length === 0 ? (
						<div className="text-center py-8">
							<Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No notifications yet</p>
						</div>
					) : (
						<div className="space-y-3">
							{notifications.map((notification) => {
								const Icon = getNotificationIcon(notification.type);
								return (
									<div
										key={notification.id}
										className={`p-4 rounded-lg border cursor-pointer transition-colors ${
											notification.read
												? "bg-background border-border hover:bg-muted/50"
												: "bg-primary/5 border-primary/20 hover:bg-primary/10"
										}`}
										onClick={() =>
											!notification.read && markAsRead(notification.id)
										}
									>
										<div className="flex gap-3">
											<div className="flex-shrink-0">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
													<Icon className="w-5 h-5 text-primary" />
												</div>
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="font-semibold text-sm mb-1">
													{notification.title}
												</h4>
												<p className="text-sm text-muted-foreground mb-2">
													{notification.message}
												</p>
												<p className="text-xs text-muted-foreground">
													{notification.time}
												</p>
											</div>
											{!notification.read && (
												<div className="flex-shrink-0">
													<div className="w-2 h-2 bg-primary rounded-full"></div>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
