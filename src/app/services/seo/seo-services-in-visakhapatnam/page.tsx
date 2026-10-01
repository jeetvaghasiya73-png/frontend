import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-visakhapatnam";

export const metadata: Metadata = {
  title: "SEO Services in Visakhapatnam for Growth | Tech Infinix",
  description: "Strengthen digital search visibility with SEO services in Visakhapatnam built to capture coastal Andhra commercial demand and drive qualified organic leads.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Visakhapatnam for Growth | Tech Infinix",
    description: "Strengthen digital search visibility with SEO services in Visakhapatnam built to capture coastal Andhra commercial demand and drive qualified organic leads.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Visakhapatnam for Growth | Tech Infinix",
    description: "Strengthen digital search visibility with SEO services in Visakhapatnam built to capture coastal Andhra commercial demand and drive qualified organic leads.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
