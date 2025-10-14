import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["health.adarcher.app"],
	typescript: {
		ignoreBuildErrors: true,
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
	output: "standalone",
};

export default nextConfig;
