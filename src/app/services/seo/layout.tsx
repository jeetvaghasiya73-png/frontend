import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional SEO & AEO Services | Search & Answer Engine Dominance | Tech Infinix",
  description:
    "Dominate Google organic rankings and AI answer engines (ChatGPT Search, Perplexity, Google SGE) with Tech Infinix's professional SEO & AEO architecture, semantic clustering, high-authority digital PR, and sub-second Core Web Vitals.",
  keywords: [
    "Professional SEO Services",
    "AEO Services",
    "Answer Engine Optimization",
    "AI Search Engine Optimization",
    "ChatGPT Search SEO",
    "Perplexity AI SEO",
    "Technical SEO Agency",
    "On-Page SEO Optimization",
    "Off-Page SEO Backlinks",
    "Core Web Vitals Optimization",
    "Next.js SEO",
    "Tech Infinix SEO",
  ],
  alternates: {
    canonical: "/services/seo",
  },
  openGraph: {
    title: "Professional SEO & AEO Services | Tech Infinix",
    description:
      "Data-driven SEO & AEO architecture: algorithm-proof topical clustering, AI search engine citations, and lightning-fast technical Core Web Vitals.",
    url: "/services/seo",
    type: "website",
    siteName: "Tech Infinix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional SEO & AEO Services | Tech Infinix",
    description:
      "Data-driven SEO & AEO architecture for fast, scalable Google ranking and AI answer engine dominance.",
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
        "@id": "https://techinfinix.com/services/seo#service",
        name: "Enterprise Search Engine Optimization (SEO) Services",
        serviceType: "Search Engine Optimization",
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: "https://techinfinix.com",
          logo: "https://techinfinix.com/icon.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-79907-38939",
            contactType: "customer service",
            areaServed: "Worldwide",
            availableLanguage: ["English", "Hindi", "Gujarati"],
          },
        },
        description:
          "Full-spectrum enterprise search engine optimization including on-page semantic structuring, authoritative off-page digital PR, and technical Core Web Vitals engineering.",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "SEO Services Architecture",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "On-Page SEO Architecture",
                description: "Semantic HTML5 structure, schema markup, keyword clustering, and NLP content alignment.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Off-Page SEO & Digital PR",
                description: "High-authority contextual editorial backlinks, brand mentions, and tiered citation networks.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Technical SEO & Core Web Vitals",
                description: "Next.js SSR/ISR rendering speed, crawl budget optimization, server latency minimization, and schema graphs.",
              },
            },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://techinfinix.com/services/seo#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://techinfinix.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://techinfinix.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "SEO Services",
            item: "https://techinfinix.com/services/seo",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://techinfinix.com/services/seo#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "How long does it take to see rankings and traffic results from SEO?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Typically, technical fixes and on-page indexation improvements yield measurable ranking improvements within 4 to 8 weeks. For competitive commercial keywords, aggressive traffic compounding accelerates between months 3 and 6 as topical authority is consolidated.",
            },
          },
          {
            "@type": "Question",
            name: "How does Tech Infinix handle modern Google AI Overviews and SGE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We optimize content using entity-based schema structures, direct informational definitions, structured data graphs, and high-trust citation sources that Google Gemini and AI Overviews explicitly cite in answer snapshots.",
            },
          },
          {
            "@type": "Question",
            name: "Do you guarantee 100% Core Web Vitals pass scores?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Because our engineering stack is centered on Next.js, headless architectures, and sub-100ms server responses, we routinely achieve 95-100 scores across Desktop and Mobile on Google PageSpeed Insights.",
            },
          },
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
