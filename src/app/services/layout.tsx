import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Technical Solutions | Tech Infinix",
  description:
    "Explore Tech Infinix's core services: SEO & Google ranking, web and app scraping with custom scraper APIs, business web development, and day-to-day workflow automation.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services & Technical Solutions | Tech Infinix",
    description:
      "Explore Tech Infinix's core services: SEO & Google ranking, web and app scraping with custom scraper APIs, business web development, and day-to-day workflow automation.",
    url: "/services",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
