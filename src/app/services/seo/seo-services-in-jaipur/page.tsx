import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-jaipur";

export const metadata: Metadata = {
  title: "SEO Services in Jaipur for Business Reach | Tech Infinix",
  description: "Strengthen local and national search visibility with SEO services in Jaipur focused on high-intent buyer acquisition and sustainable organic lead generation.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Jaipur for Business Reach | Tech Infinix",
    description: "Strengthen local and national search visibility with SEO services in Jaipur focused on high-intent buyer acquisition and sustainable organic lead generation.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Jaipur for Business Reach | Tech Infinix",
    description: "Strengthen local and national search visibility with SEO services in Jaipur focused on high-intent buyer acquisition and sustainable organic lead generation.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
