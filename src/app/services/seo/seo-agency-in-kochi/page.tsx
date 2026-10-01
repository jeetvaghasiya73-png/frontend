import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-kochi";

export const metadata: Metadata = {
  title: "SEO Agency in Kochi for Digital Expansion | Tech Infinix",
  description: "Partner with an SEO agency in Kochi to dominate local Kerala search rankings, attract commercial inquiries, and scale qualified online traffic effortlessly.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Kochi for Digital Expansion | Tech Infinix",
    description: "Partner with an SEO agency in Kochi to dominate local Kerala search rankings, attract commercial inquiries, and scale qualified online traffic effortlessly.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Kochi for Digital Expansion | Tech Infinix",
    description: "Partner with an SEO agency in Kochi to dominate local Kerala search rankings, attract commercial inquiries, and scale qualified online traffic effortlessly.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
