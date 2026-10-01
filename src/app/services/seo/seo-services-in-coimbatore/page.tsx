import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-coimbatore";

export const metadata: Metadata = {
  title: "SEO Services in Coimbatore for Growth | Tech Infinix",
  description: "Boost your industrial and retail visibility with SEO services in Coimbatore engineered to capture high-intent inquiries and build long-term search dominance.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Coimbatore for Growth | Tech Infinix",
    description: "Boost your industrial and retail visibility with SEO services in Coimbatore engineered to capture high-intent inquiries and build long-term search dominance.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Coimbatore for Growth | Tech Infinix",
    description: "Boost your industrial and retail visibility with SEO services in Coimbatore engineered to capture high-intent inquiries and build long-term search dominance.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
