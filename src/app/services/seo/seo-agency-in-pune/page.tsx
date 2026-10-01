import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-pune";

export const metadata: Metadata = {
  title: "SEO Agency in Pune for Enterprise Growth | Tech Infinix",
  description: "Collaborate with an SEO agency in Pune to capture regional search demand, improve technical performance, and scale organic brand authority via Tech Infinix.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Pune for Enterprise Growth | Tech Infinix",
    description: "Collaborate with an SEO agency in Pune to capture regional search demand, improve technical performance, and scale organic brand authority via Tech Infinix.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Pune for Enterprise Growth | Tech Infinix",
    description: "Collaborate with an SEO agency in Pune to capture regional search demand, improve technical performance, and scale organic brand authority via Tech Infinix.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
