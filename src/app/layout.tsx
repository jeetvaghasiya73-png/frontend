import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import CursorGlow from "@/components/ui/CursorGlow";
import PageLoader from "@/components/ui/PageLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora AI | Building Intelligent Systems For Modern Businesses",
  description: "We design and deploy enterprise-grade AI automation, custom software, autonomous agents, web scraping systems, and premium SaaS dashboards.",
  keywords: ["AI agents", "automation", "enterprise software", "FastAPI", "Next.js", "web scraping", "SEO"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative bg-background text-foreground overflow-x-clip">
        <Providers>
          <PageLoader />
          <div className="noise-overlay" />
          <CursorGlow />
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

