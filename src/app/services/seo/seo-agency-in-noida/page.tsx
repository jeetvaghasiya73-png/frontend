import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-noida";

export const metadata: Metadata = {
  title: "SEO Agency in Noida for Digital Traction | Tech Infinix",
  description: "Work with an SEO agency in Noida to capture high-value NCR commercial searches, outrank competitors, and scale inbound qualified leads with Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Noida for Digital Traction | Tech Infinix",
    description: "Work with an SEO agency in Noida to capture high-value NCR commercial searches, outrank competitors, and scale inbound qualified leads with Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Noida for Digital Traction | Tech Infinix",
    description: "Work with an SEO agency in Noida to capture high-value NCR commercial searches, outrank competitors, and scale inbound qualified leads with Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
