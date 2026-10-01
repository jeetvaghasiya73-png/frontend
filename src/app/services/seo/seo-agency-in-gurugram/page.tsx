import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-agency-in-gurugram";

export const metadata: Metadata = {
  title: "SEO Agency in Gurugram for Tech Brands | Tech Infinix",
  description: "Partner with an SEO agency in Gurugram to capture enterprise B2B search intent, rank in the competitive NCR corridor, and accelerate organic pipeline growth.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Agency in Gurugram for Tech Brands | Tech Infinix",
    description: "Partner with an SEO agency in Gurugram to capture enterprise B2B search intent, rank in the competitive NCR corridor, and accelerate organic pipeline growth.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Agency in Gurugram for Tech Brands | Tech Infinix",
    description: "Partner with an SEO agency in Gurugram to capture enterprise B2B search intent, rank in the competitive NCR corridor, and accelerate organic pipeline growth.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
