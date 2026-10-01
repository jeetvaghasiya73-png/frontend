import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-nagpur";

export const metadata: Metadata = {
  title: "SEO Services in Nagpur for Regional Reach | Tech Infinix",
  description: "Discover how SEO services in Nagpur can expand search visibility across Central India, capture high-intent buyers, and deliver lasting organic lead volume.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Nagpur for Regional Reach | Tech Infinix",
    description: "Discover how SEO services in Nagpur can expand search visibility across Central India, capture high-intent buyers, and deliver lasting organic lead volume.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Nagpur for Regional Reach | Tech Infinix",
    description: "Discover how SEO services in Nagpur can expand search visibility across Central India, capture high-intent buyers, and deliver lasting organic lead volume.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
