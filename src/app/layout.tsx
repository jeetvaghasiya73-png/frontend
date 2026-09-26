import type { Metadata, Viewport } from "next";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinfinix.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tech Infinix | Autonomous AI Automation, SEO & Modern Web Engineering",
    template: "%s | Tech Infinix",
  },
  description:
    "Tech Infinix engineers autonomous AI agent swarms, Google Maps Top 3 Pack SEO dominance, high-performance Next.js web applications, high-volume directory scrapers, and 24/7 WhatsApp automation pipelines.",
  keywords: [
    "AI Automation Agency",
    "Autonomous AI Agents",
    "Google Maps 3-Pack SEO",
    "Local SEO Automation",
    "Next.js Web Development",
    "Enterprise Web Scraping",
    "WhatsApp CRM Bot",
    "FastAPI Python Architecture",
    "Tech Infinix",
    "techinfinix",
    "B2B Lead Generation",
  ],
  authors: [{ name: "Tech Infinix Engineering Team", url: siteUrl }],
  creator: "Tech Infinix",
  publisher: "Tech Infinix",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Tech Infinix | Autonomous AI Automation, SEO & Modern Web Engineering",
    description:
      "Enterprise systems engineered for growth: Local SEO Top 3 rankings, lightning-fast Next.js apps, 10M+ lead scraping pipelines, and 24/7 autonomous WhatsApp bots.",
    siteName: "Tech Infinix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tech Infinix — Engineered Systems for Growth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Infinix | Autonomous AI Automation & Web Engineering",
    description:
      "We design and deploy enterprise-grade AI automation, Google Maps Top 3 SEO engines, custom Next.js web apps, and autonomous WhatsApp bots.",
    creator: "@TechInfinix",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Tech Infinix",
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
        description:
          "Enterprise AI automation agency engineering autonomous agent networks, Google Maps Top 3 SEO, web applications, and scraping systems.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-79907-38939",
          contactType: "customer service",
          email: "contact@techinfinix.com",
          availableLanguage: ["English", "Hindi", "Gujarati"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Tech Infinix",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "Tech Infinix Systems Engineering",
        url: siteUrl,
        priceRange: "$$",
        image: `${siteUrl}/og-image.png`,
        telephone: "+91-79907-38939",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Autonomous AI & Digital Growth Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Google Maps & Local SEO Dominance",
                description:
                  "Top 3-Pack placement, local keyword optimization, and automated customer review funnels.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "High-Performance Next.js Web Development",
                description:
                  "Mobile-first, conversion-focused enterprise web applications.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "High-Volume Directory & Web Scraping",
                description:
                  "Playwright crawler nodes and verified business data extraction pipelines.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "24/7 WhatsApp AI Bot Automations",
                description:
                  "Evolution API & Baileys bot workflows with instant CRM integration.",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
