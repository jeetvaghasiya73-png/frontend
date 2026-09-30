import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import CursorGlow from "@/components/ui/CursorGlow";
import PageLoader from "@/components/ui/PageLoader";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";

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
    default: "IT Solutions Provider | Web Application Development",
    template: "%s | Tech Infinix",
  },
  description:
    "Tech Infinix is an IT solutions provider offering web application development, SEO, web scraping and WhatsApp automation. Get a free quote today.",
  keywords: [
    "IT solutions provider",
    "web application development",
    "it outsourcing company",
    "outsource it services",
    "it consultancy services",
    "web development company Ahmedabad",
    "web design and development",
    "php development",
    "seo digital marketing company",
    "local seo companies",
    "whatsapp automation software",
    "automation services",
    "workflow automation services",
    "automation consultant",
    "web scraping in india",
    "web scraping service",
    "website scraping service",
    "web data extraction",
    "Tech Infinix",
    "techinfinix",
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
    title: "IT Solutions Provider | Web Application Development — Tech Infinix",
    description:
      "Tech Infinix is an IT solutions provider offering web application development, SEO, web scraping and WhatsApp automation. Get a free quote today.",
    siteName: "Tech Infinix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tech Infinix — IT Solutions Provider & Web Application Development Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IT Solutions Provider | Web Application Development — Tech Infinix",
    description:
      "Tech Infinix is an IT solutions provider offering web application development, SEO, web scraping and WhatsApp automation. Get a free quote today.",
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
          "Tech Infinix is an IT solutions provider and web application development company based in Ahmedabad, offering IT outsourcing, SEO, web scraping, and WhatsApp automation services.",
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
        name: "Tech Infinix — IT Solutions Provider",
        url: siteUrl,
        priceRange: "$$",
        image: `${siteUrl}/og-image.png`,
        telephone: "+91-79907-38939",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "IT Solutions & Digital Growth Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Web Application Development & Web Design",
                description:
                  "Custom web application development, web design and development, and PHP development for businesses of all sizes.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "SEO & Digital Marketing",
                description:
                  "Local SEO, on-page and off-page SEO, and digital marketing services to help businesses rank higher on Google.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Web Scraping & Data Extraction",
                description:
                  "Professional web scraping service and web data extraction for businesses in India and globally.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "WhatsApp Automation & Workflow Automation",
                description:
                  "WhatsApp automation software, workflow automation services, and automation consulting for modern businesses.",
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
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
