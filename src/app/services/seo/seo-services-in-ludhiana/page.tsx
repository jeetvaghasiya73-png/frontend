import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-ludhiana";

export const metadata: Metadata = {
  title: "SEO Services in Ludhiana for Businesses | Tech Infinix",
  description: "Expand your market reach with targeted SEO services in Ludhiana engineered to capture industrial buyers, rank for high-intent terms, and scale revenue.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Ludhiana for Businesses | Tech Infinix",
    description: "Expand your market reach with targeted SEO services in Ludhiana engineered to capture industrial buyers, rank for high-intent terms, and scale revenue.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Ludhiana for Businesses | Tech Infinix",
    description: "Expand your market reach with targeted SEO services in Ludhiana engineered to capture industrial buyers, rank for high-intent terms, and scale revenue.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
