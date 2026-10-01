import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-ahmedabad";

export const metadata: Metadata = {
  title: "SEO Services in Ahmedabad for Business | Tech Infinix",
  description: "Accelerate your market reach with SEO services in Ahmedabad designed to drive targeted buyer inquiries, build domain authority, and scale with Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Ahmedabad for Business | Tech Infinix",
    description: "Accelerate your market reach with SEO services in Ahmedabad designed to drive targeted buyer inquiries, build domain authority, and scale with Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Ahmedabad for Business | Tech Infinix",
    description: "Accelerate your market reach with SEO services in Ahmedabad designed to drive targeted buyer inquiries, build domain authority, and scale with Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
