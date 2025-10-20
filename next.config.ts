import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["health.adarcher.app"],
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		// Allow builds in CI or Docker without requiring ESLint runtime deps.
		// This prevents the Next.js build from failing due to missing eslint packages
		// in the container environment. Linting should still be run locally or in CI
		// as part of your pipeline if desired.
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
		],
	},
	// output: "standalone", // Temporarily disable standalone output to test API routes
};

export default nextConfig;
