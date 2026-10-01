import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-mumbai";

export const metadata: Metadata = {
  title: "SEO Agency in Mumbai for Organic Growth | Tech Infinix",
  description: "Partner with an SEO agency in Mumbai to grow search visibility, drive qualified local buyer traffic, and scale digital organic revenue with Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Mumbai for Organic Growth | Tech Infinix",
    description: "Partner with an SEO agency in Mumbai to grow search visibility, drive qualified local buyer traffic, and scale digital organic revenue with Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Mumbai for Organic Growth | Tech Infinix",
    description: "Partner with an SEO agency in Mumbai to grow search visibility, drive qualified local buyer traffic, and scale digital organic revenue with Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
