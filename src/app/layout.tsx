import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";


const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "HubHR - Modern Recruitment Platform for Fast Teams",
	description: "Streamline your hiring with AI job descriptions, visual pipelines, and team collaboration. The HubPost Labs HR solution.",
	keywords: ["HubHR", "HubPost", "HR Software", "Applicant Tracking System", "Recruitment", "Hiring", "AI Recruitment"],
	openGraph: {
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "HubHR Dashboard Preview",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
				<Toaster />
				<Analytics />
			</body>
		</html>
	);
}
