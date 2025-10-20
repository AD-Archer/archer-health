import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import type React from "react";
import "./globals.css";
import ClientClerkProvider from "../components/client-clerk-provider";

// Ensure layout runs on the server at request-time so runtime environment
// variables (like NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) are read when the
// container is started. This allows passing the publishable key at runtime
// (docker run -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...) without needing
// the key at build time.
export const dynamic = "force-dynamic";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const poppins = Poppins({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

const baseUrl =
	process.env.NEXT_PUBLIC_SITE_URL || "https://health.adarcher.app";

export const metadata: Metadata = {
	title: "Archer Health | Calorie & Health Tracker",
	description:
		"Track your calories, meals, workouts, and achieve your health goals with Archer Health.",
	metadataBase: new URL(baseUrl),
	alternates: {
		canonical: baseUrl,
	},
	openGraph: {
		title: "Archer Health | Calorie & Health Tracker",
		description:
			"Track your calories, meals, workouts, and achieve your health goals with Archer Health.",
		url: baseUrl,
		siteName: "Archer Health",
		images: [
			{
				url: "/banner.webp",
				width: 1200,
				height: 630,
				alt: "Archer Health Banner",
			},
			{ url: "/logo.webp", width: 512, height: 512, alt: "Archer Health Logo" },
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Archer Health | Calorie & Health Tracker",
		description:
			"Track your calories, meals, workouts, and achieve your health goals with Archer Health.",
		images: ["/banner.webp"],
		creator: "@ad_archer_",
	},
	keywords: [
		"Antonio Archer",
		"Archer Health",
		"Calorie Tracker",
		"Health App",
		"Meal Tracker",
		"Workout Tracker",
		"Nutrition",
		"Philadelphia",
		"Software Developer",
		"DevOps Engineer",
	],
	authors: [{ name: "Antonio Archer" }],
	creator: "Antonio Archer",
	publisher: "Antonio Archer",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	manifest: "/site.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Archer Health",
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
		other: [
			{
				rel: "icon",
				url: "/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
			{
				rel: "icon",
				url: "/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				rel: "icon",
				url: "/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (clerkKey) {
		return (
			<html lang="en" className={`${inter.variable} ${poppins.variable}`}>
				<head>
					{/* Site-level structured data */}
					<script
						id="website-json-ld"
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "WebSite",
								name: "Archer Health",
								url: baseUrl,
								potentialAction: {
									"@type": "SearchAction",
									target:
										"https://www.google.com/search?q={search_term_string}",
									"query-input": "required name=search_term_string",
								},
								sameAs: [
									"https://github.com/ad-archer",
									"https://www.linkedin.com/in/antonio-archer",
									"https://twitter.com/ad_archer_",
									"https://www.youtube.com/@ad-archer",
									"https://www.instagram.com/Antonio_DArcher",
								],
							}),
						}}
					/>
					<script
						id="json-ld"
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "Person",
								name: "Antonio Archer",
								url: "https://www.antonioarcher.com",
								image: `${baseUrl}/logo.webp`,
								jobTitle: "Software Developer & DevOps Engineer",
								worksFor: {
									"@type": "Organization",
									name: "Self-employed",
								},
								address: {
									"@type": "PostalAddress",
									addressLocality: "Philadelphia",
									addressRegion: "PA",
									addressCountry: "US",
								},
								sameAs: [
									"https://github.com/ad-archer",
									"https://www.linkedin.com/in/antonio-archer",
									"https://twitter.com/ad_archer_",
									"https://www.linktr.ee/adarcher",
									"https://www.adarcher.app",
									"https://www.youtube.com/@ad-archer",
									"https://www.instagram.com/Antonio_DArcher",
								],
							}),
						}}
					/>
					<link rel="manifest" href="/site.webmanifest" />
					<link rel="icon" href="/favicon.ico" sizes="any" />
					<link
						rel="icon"
						href="/favicon-96x96.png"
						sizes="96x96"
						type="image/png"
					/>
					<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
					<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
					<link
						rel="icon"
						href="/web-app-manifest-192x192.png"
						sizes="192x192"
						type="image/png"
					/>
					<link
						rel="icon"
						href="/web-app-manifest-512x512.png"
						sizes="512x512"
						type="image/png"
					/>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<meta name="theme-color" content="#4c5f39" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta
						name="apple-mobile-web-app-status-bar-style"
						content="default"
					/>
					<meta name="apple-mobile-web-app-title" content="Archer Health" />
				</head>
				<body className="font-sans antialiased">
					<ClientClerkProvider>
						{children}
					</ClientClerkProvider>
				</body>
			</html>
		);
	} else {
		return (
			<html lang="en" className={`${inter.variable} ${poppins.variable}`}>
				<head>
					{/* Site-level structured data */}
					<script
						id="website-json-ld"
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "WebSite",
								name: "Archer Health",
								url: baseUrl,
								potentialAction: {
									"@type": "SearchAction",
									target:
										"https://www.google.com/search?q={search_term_string}",
									"query-input": "required name=search_term_string",
								},
								sameAs: [
									"https://github.com/ad-archer",
									"https://www.linkedin.com/in/antonio-archer",
									"https://twitter.com/ad_archer_",
									"https://www.youtube.com/@ad-archer",
									"https://www.instagram.com/Antonio_DArcher",
								],
							}),
						}}
					/>
					<script
						id="json-ld"
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "Person",
								name: "Antonio Archer",
								url: "https://www.antonioarcher.com",
								image: `${baseUrl}/logo.webp`,
								jobTitle: "Software Developer & DevOps Engineer",
								worksFor: {
									"@type": "Organization",
									name: "Self-employed",
								},
								address: {
									"@type": "PostalAddress",
									addressLocality: "Philadelphia",
									addressRegion: "PA",
									addressCountry: "US",
								},
								sameAs: [
									"https://github.com/ad-archer",
									"https://www.linkedin.com/in/antonio-archer",
									"https://twitter.com/ad_archer_",
									"https://www.linktr.ee/adarcher",
									"https://www.adarcher.app",
									"https://www.youtube.com/@ad-archer",
									"https://www.instagram.com/Antonio_DArcher",
								],
							}),
						}}
					/>
					<link rel="manifest" href="/site.webmanifest" />
					<link rel="icon" href="/favicon.ico" sizes="any" />
					<link
						rel="icon"
						href="/favicon-96x96.png"
						sizes="96x96"
						type="image/png"
					/>
					<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
					<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
					<link
						rel="icon"
						href="/web-app-manifest-192x192.png"
						sizes="192x192"
						type="image/png"
					/>
					<link
						rel="icon"
						href="/web-app-manifest-512x512.png"
						sizes="512x512"
						type="image/png"
					/>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<meta name="theme-color" content="#4c5f39" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta
						name="apple-mobile-web-app-status-bar-style"
						content="default"
					/>
					<meta name="apple-mobile-web-app-title" content="Archer Health" />
				</head>
				<body className="font-sans antialiased">
					<div className="fixed inset-x-0 top-0 bg-red-600 text-white text-sm text-center py-2 z-50">
						WARNING: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.
						Authentication is disabled.
					</div>
					{children}
				</body>
			</html>
		);
	}
}
