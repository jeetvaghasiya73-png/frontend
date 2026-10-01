import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-indore";

export const metadata: Metadata = {
  title: "SEO Services in Indore for Market Growth | Tech Infinix",
  description: "Expand your online reach with specialized SEO services in Indore to capture commercial search traffic, elevate brand presence, and generate reliable leads.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Indore for Market Growth | Tech Infinix",
    description: "Expand your online reach with specialized SEO services in Indore to capture commercial search traffic, elevate brand presence, and generate reliable leads.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Indore for Market Growth | Tech Infinix",
    description: "Expand your online reach with specialized SEO services in Indore to capture commercial search traffic, elevate brand presence, and generate reliable leads.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
