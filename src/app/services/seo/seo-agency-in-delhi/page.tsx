import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-delhi";

export const metadata: Metadata = {
  title: "SEO Agency in Delhi for Scalable Growth | Tech Infinix",
  description: "Partner with an SEO agency in Delhi to enhance local search ranking, attract high-intent organic visitors, and build long-term authority with Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Delhi for Scalable Growth | Tech Infinix",
    description: "Partner with an SEO agency in Delhi to enhance local search ranking, attract high-intent organic visitors, and build long-term authority with Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Delhi for Scalable Growth | Tech Infinix",
    description: "Partner with an SEO agency in Delhi to enhance local search ranking, attract high-intent organic visitors, and build long-term authority with Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
