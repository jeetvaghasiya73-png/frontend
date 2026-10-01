import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-chennai";

export const metadata: Metadata = {
  title: "SEO Services in Chennai for Local Growth | Tech Infinix",
  description: "Choose targeted SEO services in Chennai to capture local search visibility, rank for high-intent business terms, and generate leads through Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Chennai for Local Growth | Tech Infinix",
    description: "Choose targeted SEO services in Chennai to capture local search visibility, rank for high-intent business terms, and generate leads through Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Chennai for Local Growth | Tech Infinix",
    description: "Choose targeted SEO services in Chennai to capture local search visibility, rank for high-intent business terms, and generate leads through Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
