import type { Metadata } from "next";
import "./globals.css";
import StarkZapWrapper from "@/components/StarkZapWrapper";

export const metadata: Metadata = {
  title: "Information Hunter Agents",
  description: "Decentralized marketplace for real time information gathering using autonomous AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <StarkZapWrapper>
          {children}
        </StarkZapWrapper>
      </body>
    </html>
  );
}

