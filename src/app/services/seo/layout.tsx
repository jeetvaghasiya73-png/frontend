import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
  description:
    "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
  keywords: [
    "Best search engine optimization agency",
    "On page SEO service",
    "Off page SEO services",
    "Google ranking expert",
    "Organic search engine optimization services",
    "Google search engine optimization",
    "Dental SEO services",
    "E-commerce SEO services",
    "Search engine optimization for lawyers",
    "E-commerce SEO agency",
    "SEO in e-commerce",
    "White label SEO services"
  ],
  alternates: {
    canonical: "https://www.techinfinix.com/services/seo",
  },
  openGraph: {
    title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
    description:
      "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
    url: "https://www.techinfinix.com/services/seo",
    type: "website",
    siteName: "Tech Infinix",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
    description:
      "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
  },
};

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

