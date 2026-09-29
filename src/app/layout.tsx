import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festival Guardian — Crowd Safety System",
  description:
    "AI-powered crowd safety monitoring with mesh relay alerts. Detects crowd density in real-time and relays emergency alerts even without cellular signal.",
  keywords: ["crowd safety", "festival", "AI", "mesh relay", "emergency"],
  authors: [{ name: "Festival Guardian Team" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-guardian-bg text-guardian-text antialiased">
        {children}
      </body>
    </html>
  );
}
