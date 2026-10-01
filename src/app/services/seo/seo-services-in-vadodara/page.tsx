import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-vadodara";

export const metadata: Metadata = {
  title: "SEO Services in Vadodara for Enterprises | Tech Infinix",
  description: "Drive regional market growth with strategic SEO services in Vadodara built to capture commercial buyer searches, improve rankings, and generate fresh leads.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Vadodara for Enterprises | Tech Infinix",
    description: "Drive regional market growth with strategic SEO services in Vadodara built to capture commercial buyer searches, improve rankings, and generate fresh leads.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Vadodara for Enterprises | Tech Infinix",
    description: "Drive regional market growth with strategic SEO services in Vadodara built to capture commercial buyer searches, improve rankings, and generate fresh leads.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
