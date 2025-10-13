"use client";

import { useMemo } from "react";

export function useUnitConversion() {
	// Conversion constants
	const LBS_TO_KG = 0.453592;
	const KG_TO_LBS = 2.20462;
	const CM_TO_INCHES = 2.54;
	const _INCHES_TO_CM = 1 / 2.54;

	return useMemo(
		() => ({
			// Weight conversions
			kgToLbs: (kg: number) => Math.round(kg * KG_TO_LBS),
			lbsToKg: (lbs: number) => lbs * LBS_TO_KG,

			// Height conversions
			cmToInches: (cm: number) => cm / CM_TO_INCHES,
			inchesToCm: (inches: number) => inches * CM_TO_INCHES,

			// Display formatters
			formatWeight: (weightKg: number | null, units: string) => {
				if (!weightKg) return "Not set";
				return units === "imperial"
					? `${Math.round(weightKg * KG_TO_LBS)} lbs`
					: `${Math.round(weightKg)} kg`;
			},

			formatHeight: (heightCm: number | null, units: string) => {
				if (!heightCm) return "Not set";
				if (units === "imperial") {
					const totalInches = Math.round(heightCm / CM_TO_INCHES);
					const feet = Math.floor(totalInches / 12);
					const inches = totalInches % 12;
					return `${feet}'${inches}"`;
				} else {
					return `${Math.round(heightCm)} cm`;
				}
			},

			// Get display weight from kg
			getDisplayWeight: (weightKg: number | null, units: string) => {
				if (!weightKg) return null;
				return units === "imperial"
					? Math.round(weightKg * KG_TO_LBS)
					: Math.round(weightKg);
			},

			// Convert display weight to kg
			displayWeightToKg: (displayWeight: number, units: string) => {
				return units === "imperial" ? displayWeight * LBS_TO_KG : displayWeight;
			},

			// Get display weekly goal from kg/week
			getDisplayWeeklyGoal: (weeklyGoalKg: number | null, units: string) => {
				if (!weeklyGoalKg) return null;
				return units === "imperial"
					? Math.round(weeklyGoalKg * KG_TO_LBS * 10) / 10 // Round to 1 decimal place
					: Math.round(weeklyGoalKg * 10) / 10;
			},

			// Convert display weekly goal to kg/week
			displayWeeklyGoalToKg: (displayWeeklyGoal: number, units: string) => {
				return units === "imperial"
					? displayWeeklyGoal * LBS_TO_KG
					: displayWeeklyGoal;
			},

			// Get unit labels
			getWeightUnit: (units: string) => (units === "imperial" ? "lbs" : "kg"),
			getHeightUnit: (units: string) => (units === "imperial" ? "ft/in" : "cm"),
		}),
		[],
	);
}
