import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-lucknow";

export const metadata: Metadata = {
  title: "SEO Services in Lucknow for Local Growth | Tech Infinix",
  description: "Enhance your digital search presence with SEO services in Lucknow built to capture high-value customer searches and accelerate inbound organic growth today.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Lucknow for Local Growth | Tech Infinix",
    description: "Enhance your digital search presence with SEO services in Lucknow built to capture high-value customer searches and accelerate inbound organic growth today.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Lucknow for Local Growth | Tech Infinix",
    description: "Enhance your digital search presence with SEO services in Lucknow built to capture high-value customer searches and accelerate inbound organic growth today.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
