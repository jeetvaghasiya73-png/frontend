import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
  description:
    "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
  keywords: [
    "Best search engine optimization agency",
    "On page SEO service",
    "Off page SEO services",
    "Google ranking expert",
    "Organic search engine optimization services",
    "Google search engine optimization",
    "Dental SEO services",
    "E-commerce SEO services",
    "Search engine optimization for lawyers",
    "E-commerce SEO agency",
    "SEO in e-commerce",
    "White label SEO services"
  ],
  alternates: {
    canonical: "https://www.techinfinix.com/services/seo",
  },
  openGraph: {
    title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
    description:
      "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
    url: "https://www.techinfinix.com/services/seo",
    type: "website",
    siteName: "Tech Infinix",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services | On-Page, Technical & E-commerce SEO | Tech Infinix",
    description:
      "Explore SEO services from Tech Infinix, including technical, on-page, off-page, e-commerce, and white-label SEO solutions for businesses and agencies.",
  },
};

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://www.techinfinix.com/services/seo#service",
        name: "Search Engine Optimization (SEO) Services",
        serviceType: "Search Engine Optimization",
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: "https://www.techinfinix.com",
          logo: "https://www.techinfinix.com/icon.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-79907-38939",
            contactType: "customer service",
            areaServed: "Worldwide",
            availableLanguage: ["English", "Hindi", "Gujarati"],
          },
        },
        description:
          "Professional SEO services including on-page SEO, off-page SEO, technical SEO, e-commerce SEO, and white-label SEO services.",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "SEO Services Overview",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "On-Page SEO Service",
                description: "Keyword mapping, title tag optimization, internal linking, and search intent alignment.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Off-Page SEO Services",
                description: "High-quality link acquisition, digital PR, and authority building.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Technical SEO",
                description: "Crawlability fixes, XML sitemaps, Core Web Vitals optimization, and structured data implementation.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "White Label SEO Services",
                description: "Reliable SEO fulfillment and delivery support for digital marketing agencies.",
              },
            }
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.techinfinix.com/services/seo#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.techinfinix.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.techinfinix.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "SEO Services",
            item: "https://www.techinfinix.com/services/seo",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.techinfinix.com/services/seo#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What are search engine optimization services?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Search engine optimization (SEO) services involve improving your website's visibility on search engines like Google. This includes optimizing technical performance, on-page content relevance, and off-page authority so potential customers can easily find your business.",
            },
          },
          {
            "@type": "Question",
            name: "What is the difference between on-page and off-page SEO?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "On-page SEO focuses on optimizing elements within your website, such as content, headings, and internal links. Off-page SEO involves building authority and trust outside of your website, primarily through acquiring high-quality backlinks and digital PR.",
            },
          },
          {
            "@type": "Question",
            name: "Do you offer e-commerce SEO services?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, we are an e-commerce SEO agency that helps online stores increase visibility. We optimize product pages, category structures, faceted navigation, and schema markup to drive organic traffic and product discovery.",
            },
          },
          {
            "@type": "Question",
            name: "What are white-label SEO services?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "White-label SEO services allow digital marketing agencies to outsource their SEO fulfillment to us. We handle the research, execution, and reporting under your brand name, allowing you to scale your business without hiring an in-house team.",
            },
          }
        ],
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
