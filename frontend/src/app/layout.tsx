import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AnkiFlow - Intelligent Reading Workbench",
  description:
    "Transform your reading workflow with AI-powered research tools. RSS, PDF, and more.",
  keywords: [
    "reading",
    "RSS",
    "PDF",
    "AI",
    "research",
    "notes",
    "knowledge management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
