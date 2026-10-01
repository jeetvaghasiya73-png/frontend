import { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoCityPageTemplate from "@/components/seo/SeoCityPageTemplate";
import { getCityData } from "@/app/services/seo/seo-cities-data";

const SLUG = "seo-services-in-bhubaneswar";

export const metadata: Metadata = {
  title: "SEO Services in Bhubaneswar for Growth | Tech Infinix",
  description: "Elevate your digital presence with SEO services in Bhubaneswar designed to capture Eastern India search intent, improve rankings, and generate steady leads.",
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${SLUG}`,
  },
  openGraph: {
    title: "SEO Services in Bhubaneswar for Growth | Tech Infinix",
    description: "Elevate your digital presence with SEO services in Bhubaneswar designed to capture Eastern India search intent, improve rankings, and generate steady leads.",
    url: `https://www.techinfinix.com/services/seo/${SLUG}`,
    siteName: "Tech Infinix",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services in Bhubaneswar for Growth | Tech Infinix",
    description: "Elevate your digital presence with SEO services in Bhubaneswar designed to capture Eastern India search intent, improve rankings, and generate steady leads.",
  },
};

export default function Page() {
  const pageData = getCityData(SLUG);
  if (!pageData) notFound();
  return <SeoCityPageTemplate pageData={pageData} />;
}
