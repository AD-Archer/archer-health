import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const { userId } = await auth();

	if (userId) {
		// User is logged in, redirect to dashboard
		redirect("/dashboard");
	} else {
		// User is not logged in, redirect to landing page
		redirect("/landing");
	}
}
