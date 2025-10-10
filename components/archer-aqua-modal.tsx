"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// Input/Label previously used for redeem UI which is removed; keep modal minimal.

interface ArcherAquaModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ArcherAquaModal({ open, onOpenChange }: ArcherAquaModalProps) {
	const aquaUrl =
		process.env.NEXT_PUBLIC_AQUA_BASE_URL || "https://aqua.adarcher.app";
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		"checking" | "connected" | "not-connected"
	>("checking");
	const [isSyncing, setIsSyncing] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [syncSuccess, setSyncSuccess] = useState(false);

	useEffect(() => {
		if (open) {
			checkConnectionStatus();
		}
	}, [open]);

	const checkConnectionStatus = useCallback(async () => {
		try {
			const response = await fetch("/api/user-profile");
			const data = await response.json();
			if (data.user?.archerAquaConnectionCode) {
				setConnectionStatus("connected");
			} else {
				setConnectionStatus("not-connected");
			}
		} catch {
			setConnectionStatus("not-connected");
		}
	}, []);

	const handleGenerateCode = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			const response = await fetch("/api/generate-connection-code", {
				method: "POST",
			});
			const data = await response.json();
			if (response.ok) {
				setGeneratedCode(data.connectionCode);
			} else {
				setError(data.error || "Failed to generate code");
			}
		} catch {
			setError("Network error");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSync = async () => {
		setIsSyncing(true);
		setError(null);
		setSyncSuccess(false);
		try {
			const response = await fetch("/api/sync", {
				method: "POST",
			});
			const data = await response.json();
			if (response.ok) {
				setSyncSuccess(true);
			} else {
				setError(data.error || "Failed to sync data");
			}
		} catch {
			setError("Network error during sync");
		} finally {
			setIsSyncing(false);
		}
	};

	const handleDisconnect = async () => {
		setIsDisconnecting(true);
		try {
			const response = await fetch("/api/generate-connection-code", {
				method: "DELETE",
			});

			if (response.ok) {
				setConnectionStatus("not-connected");
				setSyncSuccess(false);
				setError(null);
			} else {
				const data = await response.json();
				setError(data.error || "Failed to disconnect");
			}
		} catch (error) {
			console.error("Failed to disconnect:", error);
			setError("Network error. Please try again.");
		} finally {
			setIsDisconnecting(false);
		}
	};

	// Redeem UI removed in Archer Health modal; linking is performed from Archer Aqua.

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Connect to Archer Aqua</DialogTitle>
					<DialogDescription>
						Link your Archer Health account with Archer Aqua for advanced
						hydration tracking. Visit{" "}
						<a
							href={`https://${aquaUrl.replace(/^https?:\/\//, "")}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline"
						>
							{aquaUrl.replace(/^https?:\/\//, "")}
						</a>{" "}
						to get started.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Connection Status</h4>
						<Badge
							variant={
								connectionStatus === "connected" ? "default" : "secondary"
							}
						>
							{connectionStatus === "checking"
								? "Checking..."
								: connectionStatus === "connected"
									? "Connected"
									: "Not Connected"}
						</Badge>
					</div>

					{connectionStatus === "connected" ? (
						<div className="space-y-3">
							<div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
								<h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
									Connected to Archer Aqua
								</h4>
								<div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
									<p>
										<strong>Connection:</strong> Your accounts are linked for
										syncing hydration data.
									</p>
									<p>
										<strong>Water Tracking:</strong> Most hydration tracking
										features are available in Archer Aqua. Your hydration data
										from Archer Aqua appears here on your dashboard.
									</p>
									<p>
										<strong>Sync:</strong> Goals and hydration logs
										automatically sync between both apps.
									</p>
								</div>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={handleSync}
									disabled={isSyncing}
									className="flex-1"
								>
									{isSyncing ? "Syncing..." : "Sync Now"}
								</Button>
								<Button
									onClick={handleDisconnect}
									variant="outline"
									disabled={isDisconnecting}
									className="flex-1"
								>
									{isDisconnecting ? "Disconnecting..." : "Disconnect"}
								</Button>
							</div>
							{syncSuccess && (
								<p className="text-sm text-green-600 dark:text-green-400 mt-2">
									Sync completed successfully!
								</p>
							)}
						</div>
					) : (
						<div>
							<h4 className="font-medium mb-2">Generate Connection Code</h4>
							<p className="text-sm text-muted-foreground mb-3">
								Generate a code to link your account. Use this code in Archer
								Aqua to connect.
							</p>
							{generatedCode ? (
								<div>
									<div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-3">
										<p className="text-sm text-yellow-800 dark:text-yellow-200">
											<strong>Note:</strong> This will link your Archer Health
											and Archer Aqua accounts. You can disconnect them later if
											needed.
										</p>
									</div>
									<div className="p-3 bg-muted rounded-lg">
										<p className="text-sm font-mono">{generatedCode}</p>
										<p className="text-xs text-muted-foreground mt-1">
											Copy this code and paste it in Archer Aqua.
										</p>
									</div>
								</div>
							) : (
								<Button onClick={handleGenerateCode} disabled={isGenerating}>
									{isGenerating ? "Generating..." : "Generate Code"}
								</Button>
							)}
						</div>
					)}

					{/* Redeem Connection Code removed - Archer Aqua handles redeeming on behalf of its users. */}

					{error && (
						<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
