import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-kolkata";

export const metadata: Metadata = {
  title: "SEO Agency in Kolkata for Organic Reach | Tech Infinix",
  description: "Partner with an SEO agency in Kolkata to elevate search visibility, capture local commercial intent, and grow qualified website traffic through Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Kolkata for Organic Reach | Tech Infinix",
    description: "Partner with an SEO agency in Kolkata to elevate search visibility, capture local commercial intent, and grow qualified website traffic through Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Kolkata for Organic Reach | Tech Infinix",
    description: "Partner with an SEO agency in Kolkata to elevate search visibility, capture local commercial intent, and grow qualified website traffic through Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
