import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Digital Marketing Services | Tech Infinix",
    default: "Digital Marketing Services | Tech Infinix",
  },
  description:
    "Explore digital marketing services from Tech Infinix, including SEO, social media and performance marketing. Discuss your goals and request a proposal.",
  keywords: [
    "digital marketing services",
    "digital marketing company",
    "digital marketing agency",
    "SEO services",
    "social media marketing",
    "performance marketing",
    "online marketing",
    "paid advertising",
    "Tech Infinix digital marketing",
  ],
  alternates: {
    canonical: "https://www.techinfinix.com/services/digital-marketing",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Digital Marketing Services | Tech Infinix",
    description:
      "Explore digital marketing services from Tech Infinix, including SEO, social media and performance marketing. Discuss your goals and request a proposal.",
    url: "https://www.techinfinix.com/services/digital-marketing",
    type: "website",
    siteName: "Tech Infinix",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Digital Marketing Services | Tech Infinix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Marketing Services | Tech Infinix",
    description:
      "Explore digital marketing services from Tech Infinix, including SEO, social media and performance marketing. Discuss your goals and request a proposal.",
    images: ["/og-image.png"],
  },
};

export default function DigitalMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
