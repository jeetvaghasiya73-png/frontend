import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Services | Business & Workflow Automation | Tech Infinix",
  description:
    "Explore automation services from Tech Infinix — business automation, workflow automation, WhatsApp automation, process automation, and integration automation for growing businesses.",
  keywords: [
    "automation services",
    "business automation",
    "workflow automation services",
    "whatsapp automation software",
    "business process automation services",
    "automation consultant",
    "integration automation",
    "processing automation",
  ],
  alternates: {
    canonical: "https://www.techinfinix.com/services/automation",
  },
  openGraph: {
    title: "Automation Services | Business & Workflow Automation | Tech Infinix",
    description:
      "Explore automation services from Tech Infinix — business automation, workflow automation, WhatsApp automation, process automation, and integration automation for growing businesses.",
    url: "https://www.techinfinix.com/services/automation",
    type: "website",
    siteName: "Tech Infinix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation Services | Business & Workflow Automation | Tech Infinix",
    description:
      "Explore automation services from Tech Infinix — business automation, workflow automation, WhatsApp automation, process automation, and integration automation for growing businesses.",
  },
};

export default function AutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
