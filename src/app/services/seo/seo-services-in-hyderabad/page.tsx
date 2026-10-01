import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-hyderabad";

export const metadata: Metadata = {
  title: "SEO Services in Hyderabad for Businesses | Tech Infinix",
  description: "Leverage proven SEO services in Hyderabad to boost search rankings, capture commercial buyer demand, and scale inbound organic leads using Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Hyderabad for Businesses | Tech Infinix",
    description: "Leverage proven SEO services in Hyderabad to boost search rankings, capture commercial buyer demand, and scale inbound organic leads using Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Hyderabad for Businesses | Tech Infinix",
    description: "Leverage proven SEO services in Hyderabad to boost search rankings, capture commercial buyer demand, and scale inbound organic leads using Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
