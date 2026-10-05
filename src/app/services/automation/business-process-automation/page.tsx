import type { Metadata } from "next";
import AutomationClusterPageTemplate from "@/components/automation/AutomationClusterPageTemplate";
import { AUTOMATION_CLUSTER_PAGES } from "../automation-cluster-data";

const pageSlug = "business-process-automation";
const pageData = AUTOMATION_CLUSTER_PAGES[pageSlug];

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  alternates: {
    canonical: `https://www.techinfinix.com/services/automation/${pageSlug}`,
  },
  openGraph: {
    title: pageData.title,
    description: pageData.metaDescription,
    url: `https://www.techinfinix.com/services/automation/${pageSlug}`,
    type: "website",
  },
};

export default function BusinessProcessAutomationPage() {
  return <AutomationClusterPageTemplate pageData={pageData} />;
}
