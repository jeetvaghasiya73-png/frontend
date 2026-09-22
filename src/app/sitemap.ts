import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinfinix.com";
  const now = new Date();

  // Core public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  // Case study subpages
  const caseStudies = [
    "apex-lead-automator",
    "vortex-agent-support-node",
    "scribe-seo-automation-hub",
  ];
  caseStudies.forEach((slug) => {
    routes.push({
      url: `${baseUrl}/portfolio/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  });

  // Blog subpages
  const blogSlugs = [
    "scaling-outbound-lead-pipelines",
    "shift-to-edge-computing-databases",
  ];
  blogSlugs.forEach((slug) => {
    routes.push({
      url: `${baseUrl}/blogs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return routes;
}
