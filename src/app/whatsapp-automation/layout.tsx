import type { Metadata } from "next";
import { faqsList } from "@/components/whatsapp-automation/faq-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinfinix.com";

export const metadata: Metadata = {
  title: "WhatsApp Automation Dashboard & CRM for Lead Outreach | LeadFlow",
  description:
    "Manage WhatsApp lead outreach, automated replies, interested prospect detection, and sales calling queues from one centralized dashboard. Join the early access waitlist.",
  keywords: [
    "WhatsApp automation dashboard",
    "WhatsApp automation software",
    "WhatsApp lead generation",
    "WhatsApp outreach automation",
    "WhatsApp marketing automation",
    "WhatsApp lead management",
    "WhatsApp business automation",
    "WhatsApp automated replies",
    "WhatsApp sales automation",
    "WhatsApp lead follow-up",
    "Interested lead tracking",
    "WhatsApp calling dashboard",
    "LeadFlow CRM",
    "Tech Infinix",
  ],
  alternates: {
    canonical: `${siteUrl}/whatsapp-automation`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/whatsapp-automation`,
    title: "WhatsApp Automation Dashboard & CRM for Lead Outreach | LeadFlow",
    description:
      "Manage WhatsApp lead outreach, automated replies, interested prospect detection, and sales calling queues from one dashboard. Join the waitlist for launch updates.",
    siteName: "LeadFlow by Tech Infinix",
    images: [
      {
        url: "/screenshots/whatsapp-automation/lead-management-pipeline.png",
        width: 1200,
        height: 675,
        alt: "LeadFlow WhatsApp Automation CRM Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Automation Dashboard & CRM for Lead Outreach | LeadFlow",
    description:
      "Manage WhatsApp lead outreach, automated replies, interested prospect detection, and sales calling queues from one dashboard. Join the waitlist for launch updates.",
    images: ["/screenshots/whatsapp-automation/lead-management-pipeline.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WhatsAppAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/whatsapp-automation#software`,
        name: "LeadFlow WhatsApp Automation CRM",
        operatingSystem: "Web Browser",
        applicationCategory: "BusinessApplication",
        description:
          "Enterprise WhatsApp automation dashboard connecting lead outreach, omni-channel conversation inbox, interested prospect triage, and integrated sales telecalling desks.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
        },
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: siteUrl,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/whatsapp-automation#webpage`,
        url: `${siteUrl}/whatsapp-automation`,
        name: "WhatsApp Automation Dashboard & CRM for Lead Outreach",
        description:
          "Manage WhatsApp lead outreach, automated replies, interested prospect detection, and sales calling queues from one dashboard.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "WhatsApp Automation",
              item: `${siteUrl}/whatsapp-automation`,
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/whatsapp-automation#faq`,
        mainEntity: faqsList.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
