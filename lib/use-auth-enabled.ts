"use client";

import { useEffect, useState } from "react";

export function useAuthEnabled() {
	const [enabled, setEnabled] = useState<boolean | null>(null);

	useEffect(() => {
		let mounted = true;
		fetch("/api/auth-enabled")
			.then((res) => res.json())
			.then((data) => {
				if (mounted) setEnabled(Boolean(data.enabled));
			})
			.catch((err) => {
				console.error("Failed to fetch auth-enabled:", err);
				if (mounted) setEnabled(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	return enabled;
}
