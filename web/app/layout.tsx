import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UDO | Optimize RAG Pipelines & Reduce LLM Token Costs",
  description: "UDO (Universal Data Optimizer) is a high-performance Rust engine that cleans, masks, and prunes data for AI Agents. Reduce OpenAI costs by 40% and secure PII in real-time.",
  keywords: ["RAG Optimization", "LLM Context Window", "Data Pruning", "PII Redaction", "AI ETL", "Rust Data Pipeline", "Reduce LLM Latency", "Vector DB Optimization"],
  openGraph: {
    title: "UDO - The Context Valve for AI Agents",
    description: "Stop feeding garbage to your LLM. Use UDO to slice, mask, and optimize data streams in real-time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
