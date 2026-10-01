import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-surat";

export const metadata: Metadata = {
  title: "SEO Services in Surat for Commercial Growth | Tech Infinix",
  description: "Scale your business visibility with SEO services in Surat focused on capturing regional commercial searches, local market inquiries, and steady organic growth.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Surat for Commercial Growth | Tech Infinix",
    description: "Scale your business visibility with SEO services in Surat focused on capturing regional commercial searches, local market inquiries, and steady organic growth.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Surat for Commercial Growth | Tech Infinix",
    description: "Scale your business visibility with SEO services in Surat focused on capturing regional commercial searches, local market inquiries, and steady organic growth.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
