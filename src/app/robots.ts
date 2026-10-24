import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinfinix.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/techinfinix-console-77",
          "/techinfinix-console-77/",
          "/techinfinix-console-77/*",
          "/api/",
          "/api/*",
          "/_next/",
          "/_next/*",
        ],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
          "ia_archiver"
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/techinfinix-console-77",
          "/techinfinix-console-77/",
          "/techinfinix-console-77/*",
          "/api/",
          "/api/*",
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
