import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-bengaluru";

export const metadata: Metadata = {
  title: "SEO Agency in Bengaluru for Tech Brands | Tech Infinix",
  description: "Work with an SEO agency in Bengaluru to optimize organic search pipelines, attract high-intent software buyers, and expand national reach with Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Bengaluru for Tech Brands | Tech Infinix",
    description: "Work with an SEO agency in Bengaluru to optimize organic search pipelines, attract high-intent software buyers, and expand national reach with Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Bengaluru for Tech Brands | Tech Infinix",
    description: "Work with an SEO agency in Bengaluru to optimize organic search pipelines, attract high-intent software buyers, and expand national reach with Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
