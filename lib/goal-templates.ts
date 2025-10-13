import type { Goal } from "@/app/data/data";

export interface GoalTemplate {
	id: string;
	type: Goal["type"];
	name: string;
	description: string;
	defaultTarget: number;
	unit: string;
	category: "tracking" | "achievement" | "streak";
	example: string;
}

export const goalTemplates: GoalTemplate[] = [
	{
		id: "weight-input-daily",
		type: "custom",
		name: "Input Weight Daily",
		description: "Log your weight every day for a set number of weeks",
		defaultTarget: 4,
		unit: "weeks",
		category: "tracking",
		example: "Input weight 1 time per day for 4 weeks",
	},
	{
		id: "weight-input-weekly",
		type: "custom",
		name: "Input Weight Weekly",
		description: "Log your weight a certain number of times per week",
		defaultTarget: 3,
		unit: "times/week",
		category: "tracking",
		example: "Input weight 3 times per week",
	},
	{
		id: "food-log-daily",
		type: "custom",
		name: "Log Food Daily",
		description: "Log your meals every day for a set number of days",
		defaultTarget: 30,
		unit: "days",
		category: "streak",
		example: "Log food for 30 consecutive days",
	},
	{
		id: "food-log-weekly",
		type: "custom",
		name: "Log Food Weekly",
		description: "Log food for a set number of weeks",
		defaultTarget: 4,
		unit: "weeks",
		category: "tracking",
		example: "Log food for 4 weeks",
	},
	{
		id: "calorie-goal-streak",
		type: "custom",
		name: "Stay Within Calorie Goal",
		description: "Stay within your daily calorie goal for consecutive days",
		defaultTarget: 7,
		unit: "days",
		category: "streak",
		example: "Stay within calorie goal for 7 days",
	},
	{
		id: "protein-goal-daily",
		type: "macro",
		name: "Meet Daily Protein Goal",
		description: "Meet your daily protein target for consecutive days",
		defaultTarget: 7,
		unit: "days",
		category: "streak",
		example: "Meet protein goal for 7 days",
	},
	{
		id: "workout-weekly",
		type: "activity",
		name: "Exercise Regularly",
		description:
			"Complete your exercise routine regularly. For full fitness tracking, visit Archer Fitness.",
		defaultTarget: 7,
		unit: "days/week",
		category: "achievement",
		example: "Exercise 3-5 days per week",
	},
	{
		id: "water-daily",
		type: "water",
		name: "Daily Water Intake",
		description: "Meet your daily water goal for consecutive days",
		defaultTarget: 7,
		unit: "days",
		category: "streak",
		example: "Meet water goal for 7 days",
	},
];

export function createGoalFromTemplate(
	template: GoalTemplate,
	customTarget?: number,
	deadline?: string,
): Omit<Goal, "id" | "current" | "isActive"> {
	return {
		type: template.type,
		name: template.name,
		target: customTarget ?? template.defaultTarget,
		unit: template.unit,
		deadline,
	};
}
