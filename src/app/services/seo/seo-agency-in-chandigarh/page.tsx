import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-chandigarh";

export const metadata: Metadata = {
  title: "SEO Agency in Chandigarh for Fast Growth | Tech Infinix",
  description: "Work with an SEO agency in Chandigarh to improve Google rankings, attract qualified regional inquiries, and build sustainable organic traffic pipelines.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Chandigarh for Fast Growth | Tech Infinix",
    description: "Work with an SEO agency in Chandigarh to improve Google rankings, attract qualified regional inquiries, and build sustainable organic traffic pipelines.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Chandigarh for Fast Growth | Tech Infinix",
    description: "Work with an SEO agency in Chandigarh to improve Google rankings, attract qualified regional inquiries, and build sustainable organic traffic pipelines.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
