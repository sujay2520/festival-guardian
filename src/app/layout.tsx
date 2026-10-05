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
  themeColor: "#060609",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-guardian-bg text-guardian-text antialiased">
        {children}
      </body>
    </html>
  );
}
