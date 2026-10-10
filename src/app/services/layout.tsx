import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Technical Solutions | Tech Infinix",
  description:
    "Explore Tech Infinix's specialized digital services: SEO & Google search authority, high-performance custom web applications, WhatsApp business automation, and B2B web scraping intelligence.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services & Technical Solutions | Tech Infinix",
    description:
      "Explore Tech Infinix's specialized digital services: SEO & Google search authority, high-performance custom web applications, WhatsApp business automation, and B2B web scraping intelligence.",
    url: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
