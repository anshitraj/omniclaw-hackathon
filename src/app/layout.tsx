import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniClaw Console — Autonomous Commerce. Controlled.",
  description:
    "The control layer for agent money. Policy-controlled autonomous commerce on Arc Testnet with Circle wallet infrastructure, x402 paid endpoints, and real-time settlement proofs.",
  keywords: [
    "OmniClaw",
    "Arc Testnet",
    "USDC",
    "Circle Wallets",
    "Agentic Commerce",
    "x402",
    "Autonomous Payments",
    "AI Agents",
  ],
  openGraph: {
    title: "OmniClaw Console — Autonomous Commerce. Controlled.",
    description:
      "Where agents negotiate, authorize, and settle. Built for the Arc + Circle Agentic Commerce hackathon.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
