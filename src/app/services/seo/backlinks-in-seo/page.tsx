import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoClusterPageTemplate from "@/components/seo/SeoClusterPageTemplate";
import { SEO_CLUSTER_PAGES } from "@/app/services/seo/seo-cluster-data";

const pageData = SEO_CLUSTER_PAGES["backlinks-in-seo"];

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [pageData.primaryKeyword, ...pageData.secondaryKeywords],
  alternates: {
    canonical: `https://www.techinfinix.com/services/seo/${pageData.slug}`,
  },
  openGraph: {
    title: pageData.title,
    description: pageData.metaDescription,
    url: `https://www.techinfinix.com/services/seo/${pageData.slug}`,
    type: "website",
    siteName: "Tech Infinix",
  },
  twitter: {
    card: "summary_large_image",
    title: pageData.title,
    description: pageData.metaDescription,
  },
};

export default function BacklinksInSeoPage() {
  if (!pageData) notFound();
  return <SeoClusterPageTemplate pageData={pageData} />;
}
