import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-bhopal";

export const metadata: Metadata = {
  title: "SEO Services in Bhopal for Local Brands | Tech Infinix",
  description: "Unlock new customer acquisition channels with SEO services in Bhopal designed to improve regional search rankings and generate qualified inbound enquiries.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Bhopal for Local Brands | Tech Infinix",
    description: "Unlock new customer acquisition channels with SEO services in Bhopal designed to improve regional search rankings and generate qualified inbound enquiries.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Bhopal for Local Brands | Tech Infinix",
    description: "Unlock new customer acquisition channels with SEO services in Bhopal designed to improve regional search rankings and generate qualified inbound enquiries.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
