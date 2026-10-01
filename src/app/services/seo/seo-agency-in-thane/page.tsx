import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-thane";

export const metadata: Metadata = {
  title: "SEO Agency in Thane for Business Growth | Tech Infinix",
  description: "Partner with an SEO agency in Thane to maximize search visibility across the Mumbai Metropolitan Region, attract local clients, and scale online revenue.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Thane for Business Growth | Tech Infinix",
    description: "Partner with an SEO agency in Thane to maximize search visibility across the Mumbai Metropolitan Region, attract local clients, and scale online revenue.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Thane for Business Growth | Tech Infinix",
    description: "Partner with an SEO agency in Thane to maximize search visibility across the Mumbai Metropolitan Region, attract local clients, and scale online revenue.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
