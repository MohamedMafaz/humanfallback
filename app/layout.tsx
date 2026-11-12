import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanFallback — the human workforce for AI agents",
  description:
    "When an AI agent reaches the edge of what it can do, HumanFallback finds a real person who can. Agent-delegated tasks, verified evidence and PayPal payments in one workflow.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "HumanFallback",
    description: "When AI can't do it, we find someone who can.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
