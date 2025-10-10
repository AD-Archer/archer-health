"use client";

import { AlertCircle, Home, Search, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NotFoundPage() {
	const [showReportForm, setShowReportForm] = useState(false);
	const [reportData, setReportData] = useState({
		name: "",
		email: "",
		description: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleReportSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const report = {
				name: reportData.name || "Anonymous User",
				email: reportData.email || "noreply@archerhealth.com",
				subject: "404 Error Report - Page Not Found",
				message: `
404 Error Report
================

Time: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Referrer: ${document.referrer || "Direct"}

User Report:
${reportData.description}

Requested Path: ${window.location.pathname}
Search Params: ${window.location.search}
        `,
			};

			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(report),
			});

			if (response.ok) {
				toast.success(
					"Thank you for reporting this issue! We'll look into it.",
				);
				setShowReportForm(false);
				setReportData({ name: "", email: "", description: "" });
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to send report. Please try again.");
			}
		} catch (error) {
			console.error("Error sending report:", error);
			toast.error("Failed to send report. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setReportData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<Search className="w-8 h-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-display">
						Page Not Found
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-muted-foreground">
						The page you're looking for doesn't exist or has been moved.
					</p>

					<div className="bg-muted p-3 rounded-lg">
						<p className="text-sm font-mono break-all text-muted-foreground">
							{typeof window !== "undefined" ? window.location.pathname : ""}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-2">
						<Button asChild className="flex-1">
							<Link href="/">
								<Home className="w-4 h-4 mr-2" />
								Go Home
							</Link>
						</Button>
						<Button
							variant="outline"
							onClick={() => setShowReportForm(!showReportForm)}
							className="flex-1"
						>
							<AlertCircle className="w-4 h-4 mr-2" />
							Report Issue
						</Button>
					</div>

					{showReportForm && (
						<Card className="mt-4">
							<CardHeader>
								<CardTitle className="text-lg">Report This Issue</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleReportSubmit} className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">Name (Optional)</Label>
											<Input
												id="name"
												name="name"
												type="text"
												value={reportData.name}
												onChange={handleInputChange}
												placeholder="Your name"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email (Optional)</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={reportData.email}
												onChange={handleInputChange}
												placeholder="your.email@example.com"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">
											What were you trying to do?
										</Label>
										<Textarea
											id="description"
											name="description"
											value={reportData.description}
											onChange={handleInputChange}
											placeholder="Describe what you were looking for or what went wrong..."
											rows={3}
											required
										/>
									</div>

									<div className="flex gap-2">
										<Button
											type="submit"
											disabled={isSubmitting}
											className="flex-1"
										>
											{isSubmitting ? (
												<>Sending...</>
											) : (
												<>
													<Send className="w-4 h-4 mr-2" />
													Send Report
												</>
											)}
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowReportForm(false)}
										>
											Cancel
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					)}

					<p className="text-xs text-muted-foreground">
						If you believe this is an error, please use the "Report Issue"
						button above.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
