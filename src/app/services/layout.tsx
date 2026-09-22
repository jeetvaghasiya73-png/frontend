import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Systems Architecture | Tech Infinix",
  description:
    "Explore Tech Infinix's core capabilities: Google Maps Local SEO 3-Pack, high-performance Next.js web applications, high-volume directory scraping, and autonomous WhatsApp CRM pipelines.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services & Systems Architecture | Tech Infinix",
    description:
      "Explore Tech Infinix's core capabilities: Google Maps Local SEO 3-Pack, high-performance Next.js web applications, high-volume directory scraping, and autonomous WhatsApp CRM pipelines.",
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
