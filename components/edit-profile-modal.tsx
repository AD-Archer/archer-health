"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useUnitConversion } from "@/lib/use-unit-conversion";

interface EditProfileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({
	open,
	onOpenChange,
}: EditProfileModalProps) {
	const { user: clerkUser } = useUser();
	const { user, updateUser } = useStore();
	const { getDisplayWeight, displayWeightToKg } = useUnitConversion();
	const [formData, setFormData] = useState({
		currentWeight: getDisplayWeight(user.currentWeight, user.units) ?? "",
		goalWeight: getDisplayWeight(user.goalWeight, user.units) ?? "",
		// For imperial, store feet and inches separately
		height: user.height ?? "",
		heightFeet:
			user.units === "imperial" && user.height
				? Math.floor(user.height / 2.54 / 12)
				: "", // Convert cm to feet
		heightInches:
			user.units === "imperial" && user.height
				? Math.round((user.height / 2.54) % 12)
				: "", // Convert cm to inches
		age: user.age ?? "",
		gender: user.gender ?? "other",
		goalType: user.goalType ?? "maintain",
		weeklyGoal:
			user.units === "imperial" && user.weeklyGoal
				? Math.round(user.weeklyGoal * 2.20462)
				: (user.weeklyGoal ?? ""),
		units: user.units ?? "imperial",
		timezone: user.timezone ?? "",
		name:
			(typeof clerkUser?.fullName === "string"
				? clerkUser.fullName
				: `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim()) ||
			user.name ||
			"",
	} as {
		currentWeight?: number | string;
		goalWeight?: number | string;
		height?: number | string;
		heightFeet?: number | string;
		heightInches?: number | string;
		age?: number | string;
		gender?: "male" | "female" | "other";
		goalType?: "lose" | "maintain" | "gain";
		weeklyGoal?: number | string;
		units?: "metric" | "imperial";
		timezone?: string;
		name?: string;
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isLoadingData, setIsLoadingData] = useState(false);

	// Fetch user data when modal opens
	useEffect(() => {
		if (open && clerkUser) {
			fetchUserData();
		}
	}, [open, clerkUser]);

	const fetchUserData = async () => {
		setIsLoadingData(true);
		try {
			const response = await fetch("/api/user-profile");
			if (response.ok) {
				const userData = await response.json();
				const dbUser = userData.user || {};
				const userUnits = dbUser.units || user.units || "imperial";
				setFormData({
					currentWeight:
						getDisplayWeight(dbUser.currentWeight, userUnits) ?? "",
					goalWeight: getDisplayWeight(dbUser.goalWeight, userUnits) ?? "",
					height: dbUser.height ?? user.height ?? "",
					heightFeet:
						userUnits === "imperial" && dbUser.height
							? Math.floor(dbUser.height / 2.54 / 12)
							: "",
					heightInches:
						userUnits === "imperial" && dbUser.height
							? Math.round((dbUser.height / 2.54) % 12)
							: "",
					age: dbUser.age ?? user.age ?? "",
					gender: dbUser.gender ?? user.gender ?? "other",
					goalType: dbUser.goalType ?? user.goalType ?? "maintain",
					weeklyGoal: dbUser.weeklyGoal
						? userUnits === "imperial"
							? Math.round(dbUser.weeklyGoal * 2.20462)
							: Math.round(dbUser.weeklyGoal)
						: (user.weeklyGoal ?? ""),
					units: dbUser.units ?? user.units ?? "imperial",
					timezone: dbUser.timezone ?? user.timezone ?? "",
					// Removed email and username from editable fields
					name:
						(typeof clerkUser?.fullName === "string"
							? clerkUser.fullName
							: `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim()) ||
						dbUser.name ||
						user.name ||
						"",
				});
			}
		} catch (error) {
			console.error("Failed to fetch user data:", error);
		} finally {
			setIsLoadingData(false);
		}
	};

	const handleSave = async () => {
		if (!clerkUser) return;

		setIsLoading(true);
		setError("");

		try {
			// Prepare data for API - convert height if needed
			const finalData = { ...formData };
			// Always include name and email from Clerk user
			if (clerkUser) {
				(finalData as Record<string, any>).name =
					typeof clerkUser.fullName === "string"
						? clerkUser.fullName
						: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
				(finalData as Record<string, any>).email =
					clerkUser.primaryEmailAddress?.emailAddress;
			}
			if (formData.units === "imperial") {
				// Convert feet/inches to total inches, then to cm
				const feet = Number(formData.heightFeet);
				const inches = Number(formData.heightInches);
				if (!isNaN(feet) && !isNaN(inches)) {
					finalData.height = (feet * 12 + inches) * 2.54; // Convert inches to cm
				} else {
					finalData.height = undefined;
				}
			} else {
				// Metric: height is already in cm
				const cm = Number(formData.height);
				finalData.height = !isNaN(cm) && cm > 0 ? cm : undefined;
			}

			// Convert weights back to kg for storage
			if (formData.currentWeight) {
				finalData.currentWeight = displayWeightToKg(
					Number(formData.currentWeight),
					formData.units || "imperial",
				);
			}
			if (formData.goalWeight) {
				finalData.goalWeight = displayWeightToKg(
					Number(formData.goalWeight),
					formData.units || "imperial",
				);
			}
			if (formData.weeklyGoal) {
				finalData.weeklyGoal = displayWeightToKg(
					Number(formData.weeklyGoal),
					formData.units || "imperial",
				);
			}
			const response = await fetch("/api/user-profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(finalData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to save profile");
			}

			const savedData = await response.json();

			// Update local store with saved data
			updateUser(savedData.user);

			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save profile:", error);
			setError(
				error instanceof Error ? error.message : "Failed to save profile",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const commonTimezones = [
		{ value: "America/New_York", label: "Eastern Time (ET)" },
		{ value: "America/Chicago", label: "Central Time (CT)" },
		{ value: "America/Denver", label: "Mountain Time (MT)" },
		{ value: "America/Los_Angeles", label: "Pacific Time (PT)" },
		{ value: "America/Anchorage", label: "Alaska Time (AKT)" },
		{ value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
		{ value: "Europe/London", label: "London (GMT)" },
		{ value: "Europe/Paris", label: "Paris (CET)" },
		{ value: "Europe/Berlin", label: "Berlin (CET)" },
		{ value: "Asia/Tokyo", label: "Tokyo (JST)" },
		{ value: "Asia/Shanghai", label: "Shanghai (CST)" },
		{ value: "Asia/Dubai", label: "Dubai (GST)" },
		{ value: "Australia/Sydney", label: "Sydney (AEDT)" },
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md w-full h-[90vh] flex flex-col p-0">
				<DialogHeader className="px-6 pt-6 pb-2">
					<DialogTitle className="font-display text-2xl">
						Edit Goals & Information
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col flex-1 min-h-0">
					<ScrollArea className="flex-1 px-6 pb-6 min-h-0">
						{isLoadingData ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
									<p className="text-sm text-muted-foreground">
										Loading your profile...
									</p>
								</div>
							</div>
						) : (
							<div>
								{error && (
									<div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
										<p className="text-sm text-red-600">{error}</p>
									</div>
								)}
								<div className="space-y-6">
									{/* Goals & Personal Information */}
									{/* Removed Account Information section (email/username) */}
									{/* Weight Section */}
									<div className="space-y-4">
										<h3 className="font-semibold text-lg">
											Weight Information
										</h3>
										<div className="space-y-2">
											<Label htmlFor="currentWeight">
												Current Weight (
												{formData.units === "imperial" ? "lbs" : "kg"})
											</Label>
											<Input
												id="currentWeight"
												type="number"
												value={formData.currentWeight ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													setFormData({
														...formData,
														currentWeight:
															value === "" ? undefined : Number(value),
													});
												}}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="goalWeight">
												Goal Weight (
												{formData.units === "imperial" ? "lbs" : "kg"})
											</Label>
											<Input
												id="goalWeight"
												type="number"
												value={formData.goalWeight ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													setFormData({
														...formData,
														goalWeight:
															value === "" ? undefined : Number(value),
													});
												}}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="goalType">Goal Type</Label>
											<Select
												value={formData.goalType}
												onValueChange={(value: "lose" | "maintain" | "gain") =>
													setFormData({ ...formData, goalType: value })
												}
											>
												<SelectTrigger id="goalType">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="lose">Lose Weight</SelectItem>
													<SelectItem value="maintain">
														Maintain Weight
													</SelectItem>
													<SelectItem value="gain">Gain Weight</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="weeklyGoal">
												Weekly Goal (
												{formData.units === "imperial" ? "lbs" : "kg"}/week)
											</Label>
											<Select
												value={formData.weeklyGoal?.toString() || ""}
												onValueChange={(value) =>
													setFormData({
														...formData,
														weeklyGoal:
															value === ""
																? undefined
																: Number.parseFloat(value),
													})
												}
											>
												<SelectTrigger id="weeklyGoal">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="0.5">
														0.5 {formData.units === "imperial" ? "lbs" : "kg"}
														/week
													</SelectItem>
													<SelectItem value="1">
														1 {formData.units === "imperial" ? "lb" : "kg"}/week
													</SelectItem>
													<SelectItem value="1.5">
														1.5 {formData.units === "imperial" ? "lbs" : "kg"}
														/week
													</SelectItem>
													<SelectItem value="2">
														2 {formData.units === "imperial" ? "lbs" : "kg"}
														/week
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="space-y-4">
										<h3 className="font-semibold text-lg">
											Personal Information
										</h3>
										<div className="space-y-2">
											<Label htmlFor="height">
												Height ({formData.units === "imperial" ? "ft/in" : "cm"}
												)
											</Label>
											{formData.units === "imperial" ? (
												<div className="flex gap-2">
													<Input
														id="heightFeet"
														type="number"
														min={0}
														placeholder="ft"
														value={formData.heightFeet ?? ""}
														onChange={(e) => {
															const value = e.target.value;
															setFormData({
																...formData,
																heightFeet: value === "" ? "" : Number(value),
															});
														}}
														className="w-16"
													/>
													<span className="self-center">ft</span>
													<Input
														id="heightInches"
														type="number"
														min={0}
														max={11}
														placeholder="in"
														value={formData.heightInches ?? ""}
														onChange={(e) => {
															let val = e.target.value;
															// Clamp inches to 0-11
															if (
																val !== "" &&
																(Number(val) < 0 || Number(val) > 11)
															) {
																val = Math.max(
																	0,
																	Math.min(11, Number(val)),
																).toString();
															}
															setFormData({
																...formData,
																heightInches: val === "" ? "" : Number(val),
															});
														}}
														className="w-16"
													/>
													<span className="self-center">in</span>
												</div>
											) : (
												<Input
													id="height"
													type="number"
													value={formData.height ?? ""}
													onChange={(e) => {
														const value = e.target.value;
														setFormData({
															...formData,
															height: value === "" ? "" : Number(value),
														});
													}}
													placeholder="cm"
													className="w-24"
												/>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="age">Age</Label>
											<Input
												id="age"
												type="number"
												value={formData.age ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													setFormData({
														...formData,
														age: value === "" ? undefined : Number(value),
													});
												}}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="gender">Gender</Label>
											<Select
												value={formData.gender}
												onValueChange={(value: "male" | "female" | "other") =>
													setFormData({ ...formData, gender: value })
												}
											>
												<SelectTrigger id="gender">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="male">Male</SelectItem>
													<SelectItem value="female">Female</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									{/* Preferences */}
									<div className="space-y-4">
										<h3 className="font-semibold text-lg">Preferences</h3>
										<div className="space-y-2">
											<Label htmlFor="units">Units</Label>
											<Select
												value={formData.units}
												onValueChange={(value: "metric" | "imperial") =>
													setFormData({ ...formData, units: value })
												}
											>
												<SelectTrigger id="units">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="imperial">
														Imperial (lbs, inches, oz)
													</SelectItem>
													<SelectItem value="metric">
														Metric (kg, cm, ml)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="timezone">Timezone</Label>
											<Select
												value={formData.timezone}
												onValueChange={(value) =>
													setFormData({ ...formData, timezone: value })
												}
											>
												<SelectTrigger id="timezone">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{commonTimezones.map((tz) => (
														<SelectItem key={tz.value} value={tz.value}>
															{tz.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</div>
						)}
					</ScrollArea>
				</div>
				<div className="flex gap-3 px-6 pb-6 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={isLoading || isLoadingData}
						className="flex-1 bg-primary hover:bg-primary-dark"
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
