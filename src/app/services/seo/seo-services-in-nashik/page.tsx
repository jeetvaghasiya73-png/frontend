import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-nashik";

export const metadata: Metadata = {
  title: "SEO Services in Nashik for Local Success | Tech Infinix",
  description: "Capture valuable customer searches with SEO services in Nashik focused on ranking improvements, regional brand authority, and consistent organic conversions.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Nashik for Local Success | Tech Infinix",
    description: "Capture valuable customer searches with SEO services in Nashik focused on ranking improvements, regional brand authority, and consistent organic conversions.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Nashik for Local Success | Tech Infinix",
    description: "Capture valuable customer searches with SEO services in Nashik focused on ranking improvements, regional brand authority, and consistent organic conversions.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
